import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import crypto from "crypto";

async function verifyCustomer(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) return null;

  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err) {
    return null;
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

    const currentData = snap.exists ? snap.data() : null;
    let addresses: any[] = currentData?.addresses || [];

    const addressId = body.id || `addr_${crypto.randomBytes(6).toString("hex")}`;
    const isDefault = Boolean(body.isDefault) || addresses.length === 0;

    const newAddress = {
      id: addressId,
      fullName: String(body.fullName || "").trim(),
      phone: String(body.phone || "").trim(),
      emirate: String(body.emirate || "Dubai").trim(),
      city: String(body.city || body.emirate || "Dubai").trim(),
      area: String(body.area || "").trim(),
      addressLine1: String(body.addressLine1 || "").trim(),
      villaOrApt: String(body.villaOrApt || "").trim(),
      isDefault: isDefault,
    };

    if (isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }

    const existingIndex = addresses.findIndex((a) => a.id === addressId);
    if (existingIndex >= 0) {
      addresses[existingIndex] = newAddress;
    } else {
      addresses.push(newAddress);
    }

    if (!snap.exists) {
      await docRef.set({
        uid: decoded.uid,
        email: decoded.email || "",
        name: decoded.name || "Customer",
        phone: newAddress.phone,
        addresses,
        createdAt: new Date().toISOString(),
      });
    } else {
      await docRef.update({
        addresses,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, addresses });
  } catch (err: any) {
    console.error("[Customer Addresses API] Save error:", err);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const decoded = await verifyCustomer(req);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");
    if (!addressId) {
      return NextResponse.json({ error: "Missing address ID" }, { status: 400 });
    }

    const docRef = adminDb.collection("customers").doc(decoded.uid);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ success: true, addresses: [] });
    }

    let addresses: any[] = snap.data()?.addresses || [];
    const deletedWasDefault = addresses.find((a) => a.id === addressId)?.isDefault;
    addresses = addresses.filter((a) => a.id !== addressId);

    if (deletedWasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    await docRef.update({
      addresses,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, addresses });
  } catch (err: any) {
    console.error("[Customer Addresses API] Delete error:", err);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
