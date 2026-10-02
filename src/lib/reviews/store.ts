import fs from "fs/promises";
import path from "path";
import { adminDb } from "@/lib/firebase/admin";

export interface StoredReview {
  id: string;
  productHandle: string;
  productName?: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

const hasFirebase = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

/** Reads all reviews (from Firebase if configured, otherwise local JSON) */
export async function getAllStoredReviews(): Promise<StoredReview[]> {
  if (hasFirebase) {
    try {
      const snapshot = await adminDb.collection("reviews").orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StoredReview));
    } catch (err) {
      console.warn("Firestore fetch failed, falling back to local storage:", err);
    }
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(REVIEWS_FILE, "utf-8");
    return JSON.parse(data) as StoredReview[];
  } catch (err) {
    return [];
  }
}

/** Saves all reviews locally as backup */
export async function saveAllStoredReviewsLocal(reviews: StoredReview[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local review storage write failed (safe to ignore if on cloud/read-only hosting):", err);
  }
}

/** Gets approved reviews for a specific product handle */
export async function getApprovedReviewsForProduct(productHandle: string): Promise<StoredReview[]> {
  if (hasFirebase) {
    try {
      const snapshot = await adminDb
        .collection("reviews")
        .where("status", "==", "approved")
        .get();

      const approved = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StoredReview));
      return approved.filter(
        (r) => r.productHandle === productHandle || r.productHandle === "all"
      );
    } catch (err) {
      console.warn("Firestore approved query failed, using local store", err);
    }
  }

  const all = await getAllStoredReviews();
  return all.filter(
    (r) => r.status === "approved" && (r.productHandle === productHandle || r.productHandle === "all")
  );
}

/** Submits a new review (status: pending) */
export async function submitNewReview(data: Omit<StoredReview, "id" | "status" | "createdAt">): Promise<StoredReview> {
  const newReview: StoredReview = {
    ...data,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: "pending",
    createdAt: Date.now(),
  };

  if (hasFirebase) {
    try {
      await adminDb.collection("reviews").doc(newReview.id).set(newReview);
    } catch (err) {
      console.warn("Firestore save failed, writing to local JSON", err);
    }
  }

  const all = await getAllStoredReviews();
  const exists = all.some((r) => r.id === newReview.id);
  if (!exists) {
    all.unshift(newReview);
    await saveAllStoredReviewsLocal(all);
  }

  return newReview;
}

/** Moderates a review (approve / reject / delete) */
export async function moderateReview(id: string, action: "approve" | "reject" | "delete"): Promise<boolean> {
  if (hasFirebase) {
    try {
      const docRef = adminDb.collection("reviews").doc(id);
      if (action === "delete") {
        await docRef.delete();
      } else {
        await docRef.update({ status: action === "approve" ? "approved" : "rejected" });
      }
    } catch (err) {
      console.warn("Firestore update failed, updating local store", err);
    }
  }

  const all = await getAllStoredReviews();
  const index = all.findIndex((r) => r.id === id);
  if (index !== -1) {
    if (action === "delete") {
      all.splice(index, 1);
    } else {
      all[index].status = action === "approve" ? "approved" : "rejected";
    }
    await saveAllStoredReviewsLocal(all);
  }

  return true;
}
