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
      return NextResponse.json({ cart: [] });
    }
    const data = snap.data();
    return NextResponse.json({ cart: data?.cart || [] });
  } catch (err: any) {
    console.error("[Customer API] Get cart error:", err);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const decoded = await verifyCustomer(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];

    const docRef = adminDb.collection("customers").doc(decoded.uid);
    await docRef.set(
      {
        cart: cart,
        cartUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, count: cart.length });
  } catch (err: any) {
    console.error("[Customer API] Save cart error:", err);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
