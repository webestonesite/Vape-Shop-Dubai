import fs from "fs/promises";
import path from "path";

export interface Redirect {
  id: string;
  source: string;
  destination: string;
}

export interface RedirectsData {
  redirects: Redirect[];
}

const REDIRECTS_FILE_PATH = path.join(process.cwd(), "data", "redirects.json");

export async function getRedirects(): Promise<Redirect[]> {
  try {
    const data = await fs.readFile(REDIRECTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data) as RedirectsData;
    return parsed.redirects || [];
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("Failed to read redirects:", error);
    return [];
  }
}

export async function saveRedirects(redirects: Redirect[]): Promise<void> {
  try {
    const data: RedirectsData = { redirects };
    await fs.mkdir(path.dirname(REDIRECTS_FILE_PATH), { recursive: true });
    await fs.writeFile(REDIRECTS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save redirects:", error);
    throw error;
  }
}
