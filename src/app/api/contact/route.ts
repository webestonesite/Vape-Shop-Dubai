import { NextResponse } from "next/server";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";

const createCustomerNoteQuery = `
mutation customerCreate($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
      firstName
      lastName
    }
    userErrors {
      field
      message
    }
  }
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, orderId, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, Phone, and Message are required" },
        { status: 400 }
      );
    }

    let shopifySaved = false;

    // Try saving customer inquiry to Shopify Admin Customers / Notes
    if (ADMIN_TOKEN) {
      try {
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || name;
        const lastName = nameParts.slice(1).join(" ") || "Customer";
        const host = request.headers.get("host") || "vapeshopdubai.webestone.net";
        const dummyEmail = `${phone.replace(/[^0-9]/g, "")}@inquiry.${host.replace('www.', '')}`;

        const url = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": ADMIN_TOKEN,
          },
          body: JSON.stringify({
            query: createCustomerNoteQuery,
            variables: {
              input: {
                firstName,
                lastName,
                email: dummyEmail,
                phone: phone.startsWith("+") ? phone : `+${phone.replace(/[^0-9]/g, "")}`,
                note: `[CONTACT FORM INQUIRY] Subject: ${subject} | Order ID: ${orderId || "N/A"} | Message: ${message}`,
                tags: ["Contact Form", "Website Inquiry", subject],
              },
            },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.customerCreate?.customer?.id) {
            shopifySaved = true;
          }
        }
      } catch (err) {
        console.warn("Shopify contact form admin API error:", err);
      }
    }

    // Format pre-filled WhatsApp message for user
    const waText = encodeURIComponent(
      `*NEW WEBSITE CONTACT INQUIRY*\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Order ID:* ${orderId || "N/A"}\n` +
      `*Subject:* ${subject}\n` +
      `*Message:* ${message}`
    );
    const whatsappUrl = `https://wa.me/971582839787?text=${waText}`;

    return NextResponse.json({
      success: true,
      shopifySaved,
      whatsappUrl,
      message: "Inquiry submitted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
