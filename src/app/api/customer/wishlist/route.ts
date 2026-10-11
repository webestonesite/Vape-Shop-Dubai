import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

async function verifyCustomer(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) return null;
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const decoded = await verifyCustomer(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const docRef = adminDb.collection("customers").doc(decoded.uid);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ wishlist: [] });
    }
    const data = snap.data();
    return NextResponse.json({ wishlist: data?.wishlist || [] });
  } catch (err: any) {
    console.error("[Customer API] Get wishlist error:", err);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const decoded = await verifyCustomer(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const wishlist = Array.isArray(body.wishlist) ? body.wishlist : [];

    const docRef = adminDb.collection("customers").doc(decoded.uid);
    await docRef.set(
      {
        wishlist: wishlist,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, count: wishlist.length });
  } catch (err: any) {
    console.error("[Customer API] Save wishlist error:", err);
    return NextResponse.json({ error: "Failed to save wishlist" }, { status: 500 });
  }
}
