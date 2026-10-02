import fs from "fs/promises";
import path from "path";
import { adminDb } from "@/lib/firebase/admin";

export interface Redirect {
  id: string;
  source: string;
  destination: string;
}

export interface RedirectsData {
  redirects: Redirect[];
  updatedAt?: string;
}

const REDIRECTS_FILE_PATH = path.join(process.cwd(), "data", "redirects.json");

export async function getRedirects(): Promise<Redirect[]> {
  try {
    const doc = await adminDb.collection("settings").doc("redirects").get();
    if (doc.exists) {
      const data = doc.data() as RedirectsData;
      if (Array.isArray(data?.redirects) && data.redirects.length > 0) {
        return data.redirects;
      }
    }
  } catch (err) {
    console.warn("[redirects] Firestore read failed, falling back to local file:", err);
  }

  try {
    const data = await fs.readFile(REDIRECTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data) as RedirectsData;
    return parsed.redirects || [];
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      console.error("[redirects] Failed to read local redirects.json:", error);
    }
    return [];
  }
}

export async function saveRedirects(redirects: Redirect[]): Promise<void> {
  const data: RedirectsData = {
    redirects,
    updatedAt: new Date().toISOString(),
  };

  try {
    await adminDb.collection("settings").doc("redirects").set(data);
  } catch (err) {
    console.error("[redirects] Firestore save failed:", err);
    throw err;
  }

  try {
    await fs.mkdir(path.dirname(REDIRECTS_FILE_PATH), { recursive: true });
    await fs.writeFile(REDIRECTS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Non-fatal if filesystem is read-only in production
  }
}
