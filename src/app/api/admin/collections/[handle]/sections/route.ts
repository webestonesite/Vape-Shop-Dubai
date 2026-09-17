import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  deleteCollectionSections,
  ensureCollectionSectionsDefinition,
  fetchCollectionSections,
  saveCollectionSections,
  ShopifyConfigError,
} from "@/lib/shopify/collection-sections";
import {
  COLLECTION_SECTIONS_MAX_BYTES,
  parseCollectionSections,
  seedCollectionSections,
  serializeCollectionSections,
} from "@/lib/theme/collection-sections";
import { readPublishedRecord } from "@/lib/theme/store";
import {
  describeMatch,
  resolveTemplateKey,
  templateMatch,
  type Template,
} from "@/lib/theme/types";

/**
 * One collection's section layout, stored on the collection in Shopify.
 *
 *   GET     the saved layout, or one seeded from the theme template
 *   PUT     save the layout onto the collection
 *   DELETE  drop it, putting the page back on the theme template
 *
 * Reads are as live as the editor needs them to be, so nothing here is cached.
 */
export const dynamic = "force-dynamic";

function errorResponse(err: unknown) {
  if (err instanceof ShopifyConfigError) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
  const message = err instanceof Error ? err.message : "Unexpected error.";
  console.error("[admin] collection sections:", err);
  return NextResponse.json({ error: message }, { status: 502 });
}

/** The collection templates a merchant can start a layout from. */
function collectionTemplates(
  templates: Record<string, Template>
): { key: string; label: string; rule: string | null }[] {
  return Object.entries(templates)
    .filter(([, template]) => template.type === "collection")
    .map(([key, template]) => {
      const rule = templateMatch(template);
      return { key, label: template.label, rule: rule ? describeMatch(rule) : null };
    });
}

/**
 * GET — what the editor opens with.
 *
 * `?template=<key>` asks for a layout seeded from that template instead of the
 * one this handle resolves to, which is how "start over from a template" works
 * in the editor. Only `config` and `templateKey` are meaningful in that case;
 * `saved` still describes what is actually on the collection in Shopify.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { handle } = await params;

  try {
    const record = await fetchCollectionSections(handle);
    if (!record) {
      return NextResponse.json(
        { error: `No collection found with the handle “${handle}”.` },
        { status: 404 }
      );
    }

    // Nothing saved yet: start the merchant from what the page renders today,
    // resolved through whichever theme template currently covers this handle.
    const { settings } = await readPublishedRecord();
    const matchedKey = resolveTemplateKey(settings.templates, "collection", handle);

    const requested = new URL(request.url).searchParams.get("template");
    const templateKey =
      requested && settings.templates[requested]?.type === "collection"
        ? requested
        : matchedKey;
    const template = settings.templates[templateKey];

    // A template was asked for explicitly, so seed from it even when the
    // collection already has a saved layout — that is the point of the request.
    const seeded = seedCollectionSections(template, handle);
    const config = requested ? seeded : (record.config ?? seeded);

    return NextResponse.json({
      collection: { handle: record.handle, title: record.title },
      config,
      saved: Boolean(record.config),
      updatedAt: record.updatedAt,
      /** Which theme template the seed came from, for the "inherited from" hint. */
      templateKey,
      templateLabel: template?.label ?? "Collection pages",
      matchedTemplateKey: matchedKey,
      templates: collectionTemplates(settings.templates),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PUT — write the layout to the collection's metafield. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { handle } = await params;

  let body: { config?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Re-parse rather than trusting the client: unknown section types and ids the
  // order doesn't list are dropped before anything reaches Shopify.
  const config = parseCollectionSections(body.config);
  if (!config) {
    return NextResponse.json(
      { error: "That layout has no sections to save." },
      { status: 400 }
    );
  }

  const value = serializeCollectionSections(config, session.email || null);
  if (Buffer.byteLength(value, "utf8") > COLLECTION_SECTIONS_MAX_BYTES) {
    return NextResponse.json(
      {
        error:
          "This layout is too large for a collection metafield. Shorten the longest text sections, or move that copy into the collection description.",
      },
      { status: 413 }
    );
  }

  try {
    const record = await fetchCollectionSections(handle);
    if (!record) {
      return NextResponse.json(
        { error: `No collection found with the handle “${handle}”.` },
        { status: 404 }
      );
    }

    // Before the write, so the first save lands in a named, storefront-readable
    // field rather than as unstructured data. A problem here is reported next
    // to the save, not raised as a failure.
    const warning = await ensureCollectionSectionsDefinition();

    const updatedAt = await saveCollectionSections(record.id, value);
    revalidatePath(`/collections/${handle}`);

    return NextResponse.json({ saved: true, updatedAt, warning });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE — back to the theme template. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { handle } = await params;

  try {
    const record = await fetchCollectionSections(handle);
    if (!record) {
      return NextResponse.json(
        { error: `No collection found with the handle “${handle}”.` },
        { status: 404 }
      );
    }

    await deleteCollectionSections(record.id);
    revalidatePath(`/collections/${handle}`);

    const { settings } = await readPublishedRecord();
    const templateKey = resolveTemplateKey(settings.templates, "collection", handle);

    return NextResponse.json({
      saved: false,
      config: seedCollectionSections(settings.templates[templateKey], handle),
      templateKey,
      templateLabel: settings.templates[templateKey]?.label ?? "Collection pages",
    });
  } catch (err) {
    return errorResponse(err);
  }
}
