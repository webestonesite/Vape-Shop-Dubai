import { adminAuth } from "../src/lib/firebase/admin";

async function makeAdmin() {
  const email = "shipontalukdar.webestone@gmail.com";
  try {
    const user = await adminAuth.getUserByEmail(email);
    console.log(`Found user: ${user.uid}. Current claims:`, user.customClaims);
    
    await adminAuth.setCustomUserClaims(user.uid, { role: "admin" });
    console.log(`Successfully made ${email} an admin!`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to make admin:", error);
    process.exit(1);
  }
}

makeAdmin();
