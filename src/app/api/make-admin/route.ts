import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  
  try {
    // Set custom user claims to "admin" for the current logged-in user
    await adminAuth.setCustomUserClaims(session.sub, { role: "admin" });
    
    return NextResponse.json({ 
      success: true, 
      message: "You are now an ADMIN! Please sign out and sign back in to refresh your role." 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
