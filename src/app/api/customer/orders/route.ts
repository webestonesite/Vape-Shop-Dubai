import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";

const SHOPIFY_CUSTOMER_ORDERS_QUERY = `
query getCustomerOrders($query: String!) {
  orders(first: 25, query: $query, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        name
        createdAt
        displayFulfillmentStatus
        displayFinancialStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
          }
        }
        totalTaxSet {
          shopMoney {
            amount
          }
        }
        lineItems(first: 50) {
          edges {
            node {
              title
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                }
              }
              variant {
                id
                title
                image {
                  url
                }
                product {
                  handle
                  title
                }
              }
            }
          }
        }
        shippingAddress {
          name
          address1
          city
          province
          phone
        }
      }
    }
  }
}
`;

function mapShopifyStatus(fulfillmentStatus?: string): {
  status: "placed" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
  statusLabel: string;
} {
  const s = (fulfillmentStatus || "").toUpperCase();
  if (s === "FULFILLED") {
    return { status: "delivered", statusLabel: "Delivered" };
  }
  if (s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY") {
    return { status: "out_for_delivery", statusLabel: "Out for Delivery" };
  }
  if (s === "RESTOCKED" || s === "CANCELLED") {
    return { status: "cancelled", statusLabel: "Cancelled" };
  }
  return { status: "processing", statusLabel: "Processing & Packing" };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedUser: any = null;
  try {
    decodedUser = await adminAuth.verifyIdToken(token);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const uid = decodedUser.uid;
  const email = (decodedUser.email || "").toLowerCase().trim();

  try {
    const ordersMap = new Map<string, any>();

    // 1. Fetch from Firestore by userId
    if (uid) {
      try {
        const snapUid = await adminDb
          .collection("orders")
          .where("userId", "==", uid)
          .get();

        snapUid.forEach((doc) => {
          const data = doc.data();
          ordersMap.set(data.orderId || doc.id, { id: doc.id, ...data });
        });
      } catch (e) {
        console.warn("[Orders API] Firestore query by UID error:", e);
      }
    }

    // 2. Fetch from Firestore by customerEmail
    if (email) {
      try {
        const snapEmail = await adminDb
          .collection("orders")
          .where("customerEmail", "==", email)
          .get();

        snapEmail.forEach((doc) => {
          const data = doc.data();
          const key = data.orderId || doc.id;
          if (!ordersMap.has(key)) {
            ordersMap.set(key, { id: doc.id, ...data });
          }
        });
      } catch (e) {
        console.warn("[Orders API] Firestore query by email error:", e);
      }
    }

    // 3. Fetch from Shopify Admin API
    if (email && ADMIN_API_TOKEN && SHOPIFY_STORE) {
      try {
        const shopifyRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`, {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": ADMIN_API_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: SHOPIFY_CUSTOMER_ORDERS_QUERY,
            variables: { query: `email:${email}` },
          }),
        });

        if (shopifyRes.ok) {
          const shopifyJson = await shopifyRes.json();
          const edges = shopifyJson.data?.orders?.edges || [];

          for (const edge of edges) {
            const node = edge.node;
            const orderName = node.name || node.id;
            const key = orderName;

            const { status, statusLabel } = mapShopifyStatus(node.displayFulfillmentStatus);
            const lineItems = (node.lineItems?.edges || []).map((li: any) => {
              const itemNode = li.node;
              return {
                title: itemNode.title,
                variantTitle: itemNode.variant?.title || "",
                handle: itemNode.variant?.product?.handle || "",
                price: parseFloat(itemNode.originalUnitPriceSet?.shopMoney?.amount || "0"),
                quantity: itemNode.quantity || 1,
                image: itemNode.variant?.image?.url || "",
              };
            });

            const totalPrice = parseFloat(node.totalPriceSet?.shopMoney?.amount || "0");
            const subtotal = parseFloat(node.subtotalPriceSet?.shopMoney?.amount || totalPrice.toString());
            const vatAmount = parseFloat(node.totalTaxSet?.shopMoney?.amount || "0");

            if (ordersMap.has(key)) {
              // Update existing with live Shopify fulfillment status if more fresh
              const existing = ordersMap.get(key);
              ordersMap.set(key, {
                ...existing,
                shopifyStatus: node.displayFulfillmentStatus,
                status: status,
                statusLabel: statusLabel,
              });
            } else {
              ordersMap.set(key, {
                orderId: orderName,
                userId: uid,
                customerEmail: email,
                customerName: node.shippingAddress?.name || decodedUser.name || "Customer",
                customerPhone: node.shippingAddress?.phone || "",
                shippingAddress: {
                  firstName: node.shippingAddress?.name || "",
                  address1: node.shippingAddress?.address1 || "",
                  city: node.shippingAddress?.city || "Dubai",
                  phone: node.shippingAddress?.phone || "",
                },
                lineItems,
                totalPrice,
                subtotal,
                vatAmount,
                paymentMethod: "Cash / Card on Delivery",
                status,
                statusLabel,
                createdAt: node.createdAt,
                statusTimeline: [
                  { title: "Order Placed", description: "Order confirmed in store", timestamp: node.createdAt, completed: true },
                  { title: "Processing & Quality Check", description: "Checked and packed by Dubai fulfillment team", timestamp: node.createdAt, completed: true },
                  { title: "Out for Express Delivery", description: "Dispatched with Dubai delivery courier", timestamp: status === "out_for_delivery" || status === "delivered" ? node.createdAt : null, completed: status === "out_for_delivery" || status === "delivered" },
                  { title: "Delivered", description: "Delivered to recipient address", timestamp: status === "delivered" ? node.createdAt : null, completed: status === "delivered" },
                ],
              });
            }
          }
        }
      } catch (err) {
        console.warn("[Orders API] Shopify fetch error:", err);
      }
    }

    const ordersList = Array.from(ordersMap.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, orders: ordersList });
  } catch (err: any) {
    console.error("[Customer Orders API] error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
