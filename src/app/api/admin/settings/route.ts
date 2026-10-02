import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { THEME_CACHE_TAG } from "@/lib/theme/get-settings";
import { normalizeSettings } from "@/lib/theme/normalize";
import {
  discardDraft,
  publishDraft,
  readDraftRecord,
  readPublishedRecord,
  resetDraftToDefaults,
  writeDraft,
} from "@/lib/theme/store";

/**
 * Drop every cached copy of the storefront so a publish is visible right away.
 * `revalidateTag` clears the settings read; `revalidatePath` clears the
 * rendered pages that embedded those settings.
 */
function invalidateStorefront() {
  revalidateTag(THEME_CACHE_TAG, "max");
  revalidatePath("/", "layout");
}

/** GET — both records, so the admin can tell whether the draft is ahead. */
export async function GET() {
  const [draft, published] = await Promise.all([
    readDraftRecord(),
    readPublishedRecord(),
  ]);
  return NextResponse.json({ draft, published });
}

/** PUT — save the draft without going live. */
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { settings?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.settings || typeof body.settings !== "object") {
    return NextResponse.json({ error: "Missing settings." }, { status: 400 });
  }

  try {
    const record = await writeDraft(
      normalizeSettings(body.settings),
      session?.email ?? null
    );
    return NextResponse.json({ draft: record });
  } catch (err) {
    console.error("[admin] failed to save draft:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Could not save settings." },
      { status: 500 }
    );
  }
}

/** POST — publish / discard / reset, chosen by the `action` field. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action?: string; settings?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "publish": {
        // Persist whatever the editor currently has before going live, so
        // publishing never lags behind what's on screen.
        if (body.settings && typeof body.settings === "object") {
          await writeDraft(normalizeSettings(body.settings), session?.email ?? null);
        }
        const record = await publishDraft(session?.email ?? null);
        invalidateStorefront();
        return NextResponse.json({ published: record, draft: record });
      }

      case "discard": {
        const record = await discardDraft();
        return NextResponse.json({ draft: record, published: record });
      }

      case "reset": {
        const record = await resetDraftToDefaults(session?.email ?? null);
        return NextResponse.json({ draft: record });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${body.action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error(`[admin] action '${body.action}' failed:`, err);
    return NextResponse.json(
      { error: (err as Error)?.message || `Could not perform '${body.action}'.` },
      { status: 500 }
    );
  }
}
