import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  let decodedUser: any = null;
  if (token) {
    try {
      decodedUser = await adminAuth.verifyIdToken(token);
    } catch {}
  }

  try {
    // 1. Check in Firestore orders collection
    const snap = await adminDb.collection("orders").doc(id).get();
    if (snap.exists) {
      const data = snap.data();
      // Verify ownership if user is logged in
      if (
        decodedUser &&
        data?.userId &&
        data.userId !== decodedUser.uid &&
        data.customerEmail !== decodedUser.email
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({ success: true, order: { id: snap.id, ...data } });
    }

    // 2. Query Firestore by orderId field (e.g. #1042)
    const snapByField = await adminDb
      .collection("orders")
      .where("orderId", "==", id)
      .limit(1)
      .get();

    if (!snapByField.empty) {
      const doc = snapByField.docs[0];
      const data = doc.data();
      if (
        decodedUser &&
        data?.userId &&
        data.userId !== decodedUser.uid &&
        data.customerEmail !== decodedUser.email
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({ success: true, order: { id: doc.id, ...data } });
    }

    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  } catch (err: any) {
    console.error("[Single Order API] error:", err);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}
