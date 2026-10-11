import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// Helper to extract & verify bearer token
async function verifyCustomer(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
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
      const initialProfile = {
        uid: decoded.uid,
        email: decoded.email || "",
        name: decoded.name || decoded.email?.split("@")[0] || "Customer",
        phone: decoded.phone_number || "",
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      await docRef.set(initialProfile);
      return NextResponse.json({ profile: initialProfile });
    }

    return NextResponse.json({ profile: snap.data() });
  } catch (err: any) {
    console.error("[Customer API] Get profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const decoded = await verifyCustomer(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const docRef = adminDb.collection("customers").doc(decoded.uid);
    const snap = await docRef.get();

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.phone !== undefined) updates.phone = String(body.phone).trim();

    if (!snap.exists) {
      await docRef.set({
        uid: decoded.uid,
        email: decoded.email || "",
        name: updates.name || decoded.name || decoded.email?.split("@")[0] || "Customer",
        phone: updates.phone || "",
        addresses: [],
        createdAt: new Date().toISOString(),
        ...updates,
      });
    } else {
      await docRef.update(updates);
    }

    const updatedSnap = await docRef.get();
    return NextResponse.json({ success: true, profile: updatedSnap.data() });
  } catch (err: any) {
    console.error("[Customer API] Update profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
