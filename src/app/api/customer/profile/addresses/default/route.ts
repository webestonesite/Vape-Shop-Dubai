import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const { addressId } = await req.json();

    if (!addressId) {
      return NextResponse.json({ error: "Missing addressId" }, { status: 400 });
    }

    const docRef = adminDb.collection("customers").doc(decoded.uid);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const addresses: any[] = (snap.data()?.addresses || []).map((addr: any) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    await docRef.update({
      addresses,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, addresses });
  } catch (err: any) {
    console.error("[Customer Default Address] error:", err);
    return NextResponse.json({ error: "Failed to update default address" }, { status: 500 });
  }
}
