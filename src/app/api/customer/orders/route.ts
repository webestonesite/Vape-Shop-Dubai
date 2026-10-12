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
        closed
        cancelledAt
        tags
        displayFulfillmentStatus
        displayFinancialStatus
        fulfillments(first: 5) {
          status
          displayStatus
          createdAt
        }
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
                  featuredImage {
                    url
                  }
                }
              }
            }
          }
        }
        note
        customAttributes {
          key
          value
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

function mapShopifyStatus(node: {
  displayFulfillmentStatus?: string;
  displayFinancialStatus?: string;
  closed?: boolean;
  cancelledAt?: string | null;
  tags?: string[];
  fulfillments?: Array<{ status?: string; displayStatus?: string }>;
}): {
  status: "order_received" | "confirmed" | "to_receive" | "delivered" | "cancelled";
  statusLabel: string;
} {
  const fulfillmentStatus = (node.displayFulfillmentStatus || "").toUpperCase();
  const financialStatus = (node.displayFinancialStatus || "").toUpperCase();
  const tags = (node.tags || []).map((t: string) => t.toLowerCase());
  const isClosed = Boolean(node.closed);
  const isCancelled =
    Boolean(node.cancelledAt) ||
    tags.includes("cancelled") ||
    tags.includes("canceled") ||
    fulfillmentStatus === "CANCELLED" ||
    fulfillmentStatus === "RESTOCKED";

  if (isCancelled) {
    return { status: "cancelled", statusLabel: "Cancelled" };
  }

  // 4. Delivered: When marked as delivered or order closed
  const hasDeliveredFulfillment = (node.fulfillments || []).some(
    (f) => (f.displayStatus || "").toUpperCase() === "DELIVERED"
  );
  if (isClosed || hasDeliveredFulfillment || tags.includes("delivered") || tags.includes("received")) {
    return { status: "delivered", statusLabel: "Delivered" };
  }

  // 3. To Receive: When marked as fulfilled / out for delivery
  const hasActiveFulfillment = (node.fulfillments || []).some(
    (f) => (f.status || "").toUpperCase() === "SUCCESS" || (f.status || "").toUpperCase() === "OPEN"
  );
  if (
    fulfillmentStatus === "FULFILLED" ||
    fulfillmentStatus === "PARTIALLY_FULFILLED" ||
    fulfillmentStatus === "IN_TRANSIT" ||
    fulfillmentStatus === "OUT_FOR_DELIVERY" ||
    hasActiveFulfillment ||
    tags.includes("shipped") ||
    tags.includes("fulfilled") ||
    tags.includes("to receive") ||
    tags.includes("out for delivery")
  ) {
    return { status: "to_receive", statusLabel: "To Receive" };
  }

  // 2. Order Confirmed: In progress in Shopify
  if (
    fulfillmentStatus === "IN_PROGRESS" ||
    fulfillmentStatus === "OPEN" ||
    tags.includes("confirmed") ||
    tags.includes("in progress") ||
    tags.includes("processing") ||
    financialStatus === "PAID"
  ) {
    return { status: "confirmed", statusLabel: "Order Confirmed" };
  }

  // 1. Order Received: Freshly placed unfulfilled order
  return { status: "order_received", statusLabel: "Order Received" };
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

            const { status, statusLabel } = mapShopifyStatus(node);
            const lineItems = (node.lineItems?.edges || []).map((li: any) => {
              const itemNode = li.node;
              const img =
                itemNode.variant?.image?.url ||
                itemNode.variant?.product?.featuredImage?.url ||
                "";
              return {
                title: itemNode.title || itemNode.variant?.product?.title || "Vape Product",
                variantTitle: itemNode.variant?.title || "",
                handle: itemNode.variant?.product?.handle || "",
                price: parseFloat(itemNode.originalUnitPriceSet?.shopMoney?.amount || "0"),
                quantity: itemNode.quantity || 1,
                image: img,
              };
            });

            const totalPrice = parseFloat(node.totalPriceSet?.shopMoney?.amount || "0");
            const subtotal = parseFloat(node.subtotalPriceSet?.shopMoney?.amount || totalPrice.toString());
            const vatAmount = parseFloat(node.totalTaxSet?.shopMoney?.amount || "0");

            const shopifyCustomNote =
              (node.customAttributes || []).find((a: any) => a.key === "Customer Note")?.value ||
              (node.note && node.note.includes("Customer Note:")
                ? node.note.split("Customer Note:")[1]?.split("\n")[0]?.trim()
                : node.note || "");

            if (ordersMap.has(key)) {
              // Update existing with live Shopify fulfillment status & real product details
              const existing = ordersMap.get(key);
              const hasCorruptItems =
                !existing.lineItems ||
                existing.lineItems.length === 0 ||
                existing.lineItems.some(
                  (it: any) =>
                    !it.title ||
                    it.title.toLowerCase().trim() === "vape product" ||
                    !it.image
                );

              const mergedLineItems =
                hasCorruptItems && lineItems.length > 0
                  ? lineItems
                  : (existing.lineItems && existing.lineItems.length > 0)
                  ? existing.lineItems.map((eli: any, idx: number) => ({
                      ...eli,
                      title:
                        !eli.title || eli.title.toLowerCase().trim() === "vape product"
                          ? lineItems[idx]?.title || eli.title || "Vape Product"
                          : eli.title,
                      image: eli.image || lineItems[idx]?.image || "",
                      handle: eli.handle || lineItems[idx]?.handle || "",
                    }))
                  : lineItems;

              const isOrderCancelled =
                status === "cancelled" ||
                (existing.status || "").toLowerCase() === "cancelled" ||
                (existing.status || "").toLowerCase() === "canceled" ||
                (existing.statusLabel || "").toLowerCase().includes("cancel");

              const resolvedStatus = isOrderCancelled ? "cancelled" : status;
              const resolvedStatusLabel = isOrderCancelled ? "Cancelled" : statusLabel;

              ordersMap.set(key, {
                ...existing,
                customerNote: existing.customerNote || shopifyCustomNote || "",
                lineItems: mergedLineItems,
                shopifyStatus: node.displayFulfillmentStatus,
                status: resolvedStatus,
                statusLabel: resolvedStatusLabel,
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
                paymentMethod: "Cash, Card & Online Link Payment on Delivery",
                customerNote: shopifyCustomNote || "",
                status,
                statusLabel,
                createdAt: node.createdAt,
                statusTimeline: [
                  {
                    title: "Order Received",
                    description: "Order received via web store",
                    timestamp: node.createdAt,
                    completed: true,
                  },
                  {
                    title: "Order Confirmed",
                    description: "In Progress & verified at Dubai warehouse",
                    timestamp: status === "confirmed" || status === "to_receive" || status === "delivered" ? node.createdAt : null,
                    completed: status === "confirmed" || status === "to_receive" || status === "delivered",
                  },
                  {
                    title: "To Receive",
                    description: "Fulfilled & out for express delivery",
                    timestamp: status === "to_receive" || status === "delivered" ? node.createdAt : null,
                    completed: status === "to_receive" || status === "delivered",
                  },
                  {
                    title: "Delivered",
                    description: "Order safely received by customer",
                    timestamp: status === "delivered" ? node.createdAt : null,
                    completed: status === "delivered",
                  },
                ],
              });
            }
          }
        }
      } catch (err) {
        console.warn("[Orders API] Shopify fetch error:", err);
      }
    }

    const ordersList = Array.from(ordersMap.values())
      .map((o) => {
        const lineItems = o.lineItems || [];
        const itemsSubtotal =
          lineItems.length > 0
            ? lineItems.reduce(
                (acc: number, it: any) =>
                  acc + (Number(it.price || 0) * Number(it.quantity || 1)),
                0
              )
            : Number(o.subtotal || o.totalPrice || 0);

        const isFreeDelivery = itemsSubtotal >= 300;
        const deliveryFee = isFreeDelivery
          ? 0
          : o.shippingFee !== undefined
          ? Number(o.shippingFee)
          : o.totalPrice && Number(o.totalPrice) > itemsSubtotal
          ? Number(o.totalPrice) - itemsSubtotal
          : 30;

        const grandTotal = itemsSubtotal + deliveryFee;

        return {
          ...o,
          subtotal: itemsSubtotal,
          shippingFee: deliveryFee,
          totalPrice: grandTotal,
        };
      })
      .sort((a, b) => {
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
