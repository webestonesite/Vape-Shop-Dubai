import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Ensure they have the secret token to escalate privileges
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized privilege escalation" }, { status: 403 });
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
