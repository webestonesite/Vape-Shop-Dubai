import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

import crypto from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Extension is derived from the MIME type, never from the client filename. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function slugify(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image"
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PNG, JPEG, WebP, AVIF, GIF or SVG." },
      { status: 415 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is larger than 5 MB." },
      { status: 413 }
    );
  }

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    // Random suffix keeps re-uploads of the same filename from clobbering each
    // other and busts any CDN cache on the old URL.
    const filename = `${slugify(file.name)}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[admin] upload failed:", err);
    return NextResponse.json(
      { error: "Could not save the file. Check that public/uploads is writable." },
      { status: 500 }
    );
  }
}
