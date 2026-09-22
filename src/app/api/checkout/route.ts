import { NextResponse } from "next/server";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";

const CART_CREATE_MUTATION = `
mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
`;

const DRAFT_ORDER_MUTATION = `
mutation draftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      name
    }
    userErrors {
      field
      message
    }
  }
}
`;

const DRAFT_ORDER_COMPLETE_MUTATION = `
mutation draftOrderComplete($id: ID!, $paymentPending: Boolean) {
  draftOrderComplete(id: $id, paymentPending: $paymentPending) {
    draftOrder {
      id
      order {
        id
        name
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

// Helper function to convert local UAE phone numbers (0501234567, 055 123 4567, etc.) to E.164 format (+971...)
function formatUAEPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned) return undefined;
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("971")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+971${cleaned.substring(1)}`;
  if (cleaned.length === 9 && cleaned.startsWith("5")) return `+971${cleaned}`;
  return `+${cleaned}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shippingAddress, paymentMethod, lineItems } = body;

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.phone || !shippingAddress.address1 || !shippingAddress.city) {
      return NextResponse.json({ error: "Missing shipping address details" }, { status: 400 });
    }

    // Properly split full name into firstName and lastName for Shopify
    const rawName = (shippingAddress.firstName || "Customer").trim();
    const nameParts = rawName.split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || ".";

    const customerEmail = shippingAddress.email && shippingAddress.email.trim() ? shippingAddress.email.trim() : undefined;
    const rawPhone = shippingAddress.phone ? shippingAddress.phone.trim() : "";
    const customerPhone = formatUAEPhone(rawPhone);

    let orderName = `VSD-${Math.floor(100000 + Math.random() * 900000)}`;
    let checkoutUrl = "";
    let shopifyCreated = false;

    // 1. Try Storefront API cartCreate to generate native Shopify checkoutUrl (if token available)
    if (STOREFRONT_TOKEN) {
      try {
        const storefrontLines = lineItems.map((item: any) => {
          let cleanId = item.variantId;
          if (cleanId && !cleanId.startsWith("gid://shopify/")) {
            const digits = cleanId.replace(/\D/g, "");
            if (digits) cleanId = `gid://shopify/ProductVariant/${digits}`;
          }
          return {
            merchandiseId: cleanId || "gid://shopify/ProductVariant/44760086216951",
            quantity: parseInt(item.quantity || "1", 10),
          };
        });

        const sfRes = await fetch(`https://${SHOPIFY_STORE}/api/2024-10/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
          },
          body: JSON.stringify({
            query: CART_CREATE_MUTATION,
            variables: {
              input: {
                lines: storefrontLines,
                buyerIdentity: {
                  countryCode: "AE",
                  email: customerEmail,
                  phone: customerPhone,
                },
              },
            },
          }),
        });

        if (sfRes.ok) {
          const sfJson = await sfRes.json();
          const cartData = sfJson.data?.cartCreate?.cart;
          if (cartData?.checkoutUrl) {
            checkoutUrl = cartData.checkoutUrl;
            shopifyCreated = true;
          }
        }
      } catch (err) {
        console.warn("Storefront cartCreate error:", err);
      }
    }

    // 2. Admin API Draft Order creation (Creates real, fully-populated order in Shopify)
    if (ADMIN_API_TOKEN) {
      try {
        const buildInputPayload = (useVariantIds: boolean) => {
          const formattedLineItems = lineItems.map((item: any) => {
            let finalVariantId = item.variantId;
            if (finalVariantId && !finalVariantId.startsWith("gid://shopify/")) {
              const cleanId = finalVariantId.replace(/\D/g, "");
              if (cleanId) finalVariantId = `gid://shopify/ProductVariant/${cleanId}`;
            }

            if (useVariantIds && finalVariantId) {
              return {
                variantId: finalVariantId,
                quantity: parseInt(item.quantity || "1", 10),
              };
            } else {
              return {
                title: item.name || "Vape Product",
                originalUnitPrice: parseFloat(item.price || "0").toFixed(2),
                quantity: parseInt(item.quantity || "1", 10),
              };
            }
          });

          return {
            email: customerEmail,
            phone: customerPhone,
            lineItems: formattedLineItems,
            shippingAddress: {
              firstName: firstName,
              lastName: lastName,
              address1: shippingAddress.address1,
              city: shippingAddress.city,
              phone: customerPhone,
              country: "United Arab Emirates",
            },
            billingAddress: {
              firstName: firstName,
              lastName: lastName,
              address1: shippingAddress.address1,
              city: shippingAddress.city,
              phone: customerPhone,
              country: "United Arab Emirates",
            },
            note: `Customer Name: ${rawName}\nPhone: ${rawPhone} (Formatted: ${customerPhone || "N/A"})\nDelivery Address: ${shippingAddress.address1}, ${shippingAddress.city}\nPayment Method: ${paymentMethod}`,
            customAttributes: [
              { key: "Customer Name", value: rawName },
              { key: "Customer Phone", value: rawPhone },
              { key: "Formatted Phone", value: customerPhone || rawPhone },
              { key: "Delivery Address", value: `${shippingAddress.address1}, ${shippingAddress.city}` },
              { key: "Payment Method", value: paymentMethod },
              { key: "Checkout Source", value: "Headless Web Store" },
            ],
            tags: ["Headless Order", paymentMethod === "Cash on Delivery" ? "COD" : "Card on Delivery"],
          };
        };

        const createAndCompleteDraftOrder = async (inputPayload: any) => {
          const adminRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`, {
            method: "POST",
            headers: {
              "X-Shopify-Access-Token": ADMIN_API_TOKEN,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: DRAFT_ORDER_MUTATION,
              variables: { input: inputPayload },
            }),
          });

          if (!adminRes.ok) {
            console.error("Shopify Admin HTTP error:", adminRes.statusText);
            return null;
          }

          const adminJson = await adminRes.json();
          const userErrors = adminJson.data?.draftOrderCreate?.userErrors;
          if (userErrors && userErrors.length > 0) {
            console.error("Shopify draftOrderCreate userErrors:", JSON.stringify(userErrors));
            return null;
          }

          const draftOrder = adminJson.data?.draftOrderCreate?.draftOrder;
          if (!draftOrder?.id) return null;

          const completeRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`, {
            method: "POST",
            headers: {
              "X-Shopify-Access-Token": ADMIN_API_TOKEN,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: DRAFT_ORDER_COMPLETE_MUTATION,
              variables: { id: draftOrder.id, paymentPending: true },
            }),
          });

          if (!completeRes.ok) return null;
          const compJson = await completeRes.json();
          const compErrors = compJson.data?.draftOrderComplete?.userErrors;
          if (compErrors && compErrors.length > 0) {
            console.error("Shopify draftOrderComplete userErrors:", JSON.stringify(compErrors));
          }
          return compJson.data?.draftOrderComplete?.draftOrder?.order || null;
        };

        // Attempt 1: Create order with variant IDs
        let createdOrder = await createAndCompleteDraftOrder(buildInputPayload(true));

        // Attempt 2: If variant IDs failed or rejected by Shopify, fallback to custom line items
        if (!createdOrder) {
          console.warn("Retrying draft order creation with custom line items fallback...");
          createdOrder = await createAndCompleteDraftOrder(buildInputPayload(false));
        }

        if (createdOrder?.name) {
          orderName = createdOrder.name;
          shopifyCreated = true;
        }
      } catch (err) {
        console.error("Admin draftOrder error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderName,
      orderName: orderName,
      checkoutUrl: checkoutUrl,
      shopifyCreated: shopifyCreated,
    });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}
