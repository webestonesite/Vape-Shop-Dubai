"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Truck,
  MapPin,
  User,
  LogOut,
  RefreshCw,
  FileText,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Printer,
  Zap,
  X,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Check,
  Wallet,
  Ticket,
  RotateCcw,
  MessageSquare,
  Copy,
  Tag,
  Percent,
  XCircle,
} from "lucide-react";
import { useCustomerAuth, CustomerAddress } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist, WishlistItem } from "@/context/WishlistContext";
import { TaxInvoiceModal } from "@/components/account/TaxInvoiceModal";
import { OrderTrackerModal } from "@/components/account/OrderTrackerModal";

type TabType = "overview" | "orders" | "wishlist" | "coupons" | "invoices" | "addresses" | "profile";
type OrderFilterType =
  | "all"
  | "order_received"
  | "confirmed"
  | "to_receive"
  | "delivered"
  | "returns"
  | "to_pay"
  | "to_ship"
  | "to_review"
  | "in_transit";

function getOrderStatusBadge(status?: string, statusLabel?: string) {
  const st = (status || "").toLowerCase();
  if (st === "delivered") {
    return {
      label: statusLabel || "Delivered",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    };
  }
  if (["to_receive", "shipped", "out_for_delivery", "fulfilled", "dispatched"].includes(st)) {
    return {
      label: statusLabel || "To Receive",
      className: "bg-primary/15 text-primary border border-primary/30",
    };
  }
  if (["cancelled", "canceled", "refunded"].includes(st) || (statusLabel || "").toLowerCase().includes("cancel")) {
    return {
      label: "Order Cancelled",
      className: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
    };
  }
  if (["confirmed", "in_progress", "processing", "preparing"].includes(st)) {
    return {
      label: statusLabel || "Order Confirmed",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    };
  }
  return {
    label: statusLabel || "Order Received",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  };
}

interface CustomerCoupon {
  code: string;
  title: string;
  discount: string;
  description: string;
  minSpend?: string;
  expiresAt: string;
  badge?: string;
  isClaimed?: boolean;
}

const DEFAULT_COUPONS: CustomerCoupon[] = [];

export function CustomerDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "overview");

  // Keep activeTab in sync with query parameter if present
  useEffect(() => {
    if (tabParam && ["overview", "orders", "wishlist", "coupons", "invoices", "addresses", "profile"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const {
    user,
    profile,
    addresses,
    loading: authLoading,
    logout,
    updateProfileDetails,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    resetPassword,
  } = useCustomerAuth();

  const { cart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal, setIsCartOpen } = useCart();
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<OrderFilterType>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Coupons state
  const [coupons, setCoupons] = useState<CustomerCoupon[]>(DEFAULT_COUPONS);
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleClaimPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promoInput.trim().toUpperCase();
    if (!trimmed) return;

    if (coupons.some((c) => c.code.toUpperCase() === trimmed)) {
      setPromoMessage({ text: `Coupon ${trimmed} is already in your wallet!`, type: "success" });
      setTimeout(() => setPromoMessage(null), 4000);
      setPromoInput("");
      return;
    }

    const newCoupon: CustomerCoupon = {
      code: trimmed,
      title: "Claimed Promo Voucher",
      discount: "15% OFF",
      description: "Custom promotional voucher claimed for your account.",
      minSpend: "Dhs. 100",
      expiresAt: "31 Dec 2026",
      badge: "Special Code",
      isClaimed: true,
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    setPromoMessage({ text: `🎉 Voucher ${trimmed} claimed successfully!`, type: "success" });
    setPromoInput("");
    setTimeout(() => setPromoMessage(null), 4000);
  };

  // Modals state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [selectedTrackerOrder, setSelectedTrackerOrder] = useState<any | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Address form
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    emirate: "Dubai",
    city: "Dubai",
    addressLine1: "",
    villaOrApt: "",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Profile form state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // Re-order notification state
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);
  const [cartSuccessNotice, setCartSuccessNotice] = useState<string | null>(null);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login");
    }
  }, [user, authLoading, router]);

  // Sync profile form state
  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || "");
      setProfilePhone(profile.phone || "");
    }
  }, [profile]);

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/customer/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("[Dashboard] Orders fetch error:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Order counts for quick status bar
  const orderCounts = useMemo(() => {
    let received = 0;
    let confirmed = 0;
    let toReceive = 0;
    let delivered = 0;
    let returns = 0;

    orders.forEach((o) => {
      const st = (o.status || "").toLowerCase();

      if (st === "delivered") {
        delivered++;
      } else if (["to_receive", "shipped", "in_transit", "out_for_delivery", "fulfilled", "dispatched"].includes(st)) {
        toReceive++;
      } else if (["confirmed", "in_progress", "processing", "preparing"].includes(st)) {
        confirmed++;
      } else if (["cancelled", "canceled", "refunded", "returned"].includes(st)) {
        returns++;
      } else {
        received++;
      }
    });

    return { received, confirmed, toReceive, delivered, returns };
  }, [orders]);

  // Active / in-transit orders
  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      const st = (o.status || "").toLowerCase();
      return st !== "delivered" && st !== "cancelled";
    });
  }, [orders]);

  // Active tracking stage progression for visual tracking rod animation
  const trackingStageInfo = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { activeIndex: -1, percent: 0, order: null, isCancelled: false };
    }

    const targetOrder = activeOrders[0] || orders[0];
    const st = (targetOrder.status || "").toLowerCase();
    const isCancelled =
      ["cancelled", "canceled", "refunded", "returned"].includes(st) ||
      (targetOrder.statusLabel || "").toLowerCase().includes("cancel");

    if (isCancelled) {
      return { activeIndex: 4, percent: 100, order: targetOrder, isCancelled: true };
    }
    if (st === "delivered") {
      return { activeIndex: 3, percent: 75, order: targetOrder, isCancelled: false };
    }
    if (["to_receive", "shipped", "in_transit", "out_for_delivery", "fulfilled", "dispatched"].includes(st)) {
      return { activeIndex: 2, percent: 50, order: targetOrder, isCancelled: false };
    }
    if (["confirmed", "in_progress", "processing", "preparing"].includes(st)) {
      return { activeIndex: 1, percent: 25, order: targetOrder, isCancelled: false };
    }
    // Default: received
    return { activeIndex: 0, percent: 0, order: targetOrder, isCancelled: false };
  }, [orders, activeOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const st = (o.status || "").toLowerCase();

      let matchesFilter = true;
      if (orderFilter === "all") {
        matchesFilter = true;
      } else if (orderFilter === "order_received" || orderFilter === "to_pay") {
        matchesFilter = ["order_received", "placed", "unfulfilled", "pending"].includes(st) || (!st && o.orderId);
      } else if (orderFilter === "confirmed" || orderFilter === "to_ship") {
        matchesFilter = ["confirmed", "in_progress", "processing", "preparing"].includes(st);
      } else if (orderFilter === "to_receive" || orderFilter === "in_transit") {
        matchesFilter = ["to_receive", "shipped", "in_transit", "out_for_delivery", "fulfilled", "dispatched"].includes(st);
      } else if (orderFilter === "delivered" || orderFilter === "to_review") {
        matchesFilter = st === "delivered";
      } else if (orderFilter === "returns") {
        matchesFilter = ["cancelled", "canceled", "refunded", "returned"].includes(st);
      }

      const query = orderSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (o.orderId && o.orderId.toLowerCase().includes(query)) ||
        (o.lineItems &&
          o.lineItems.some((it: any) => it.title && it.title.toLowerCase().includes(query)));

      return matchesFilter && matchesSearch;
    });
  }, [orders, orderFilter, orderSearchQuery]);

  // Handle re-order: adds all items into CartContext
  const handleReorder = (order: any) => {
    const items = order.lineItems || [];
    if (items.length === 0) return;

    let addedCount = 0;
    items.forEach((item: any) => {
      addToCart(
        {
          id: item.variantId || `re_${item.handle || item.title}`,
          name: item.title,
          price: Number(item.price || 0),
          image: item.image || "/Vape%20Shop%20Dubai%20logo%201.png",
          category: "Vape",
          variantId: item.variantId,
          handle: item.handle,
        },
        Number(item.quantity || 1)
      );
      addedCount += Number(item.quantity || 1);
    });

    setReorderNotice(`${addedCount} items added to your cart! You can proceed to checkout.`);
    setTimeout(() => {
      setReorderNotice(null);
    }, 4000);
  };

  // Add single wishlist item to cart
  const handleAddWishlistToCart = (item: WishlistItem) => {
    addToCart(
      {
        id: item.id,
        name: item.title,
        price: item.price,
        image: item.image || "/Vape%20Shop%20Dubai%20logo%201.png",
        category: item.category || "Vape",
        handle: item.handle,
      },
      1
    );
    setCartSuccessNotice(`"${item.title}" added to cart!`);
    setTimeout(() => setCartSuccessNotice(null), 3000);
  };

  // Handle Address Save
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressError(null);

    const res = await saveAddress({
      ...(editingAddress?.id ? { id: editingAddress.id } : {}),
      fullName: addressForm.fullName.trim() || profile?.name || "Customer",
      phone: addressForm.phone.trim() || profile?.phone || "",
      emirate: addressForm.emirate,
      city: addressForm.city || addressForm.emirate,
      addressLine1: addressForm.addressLine1.trim(),
      villaOrApt: addressForm.villaOrApt.trim(),
      isDefault: addressForm.isDefault,
    });

    setAddressSaving(false);
    if (res.success) {
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setAddressForm({
        fullName: "",
        phone: "",
        emirate: "Dubai",
        city: "Dubai",
        addressLine1: "",
        villaOrApt: "",
        isDefault: false,
      });
    } else {
      setAddressError(res.error || "Failed to save address");
    }
  };

  const handleEditAddress = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      emirate: addr.emirate,
      city: addr.city || addr.emirate,
      addressLine1: addr.addressLine1,
      villaOrApt: addr.villaOrApt || "",
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileNotice(null);
    const res = await updateProfileDetails({
      name: profileName,
      phone: profilePhone,
    });
    setProfileSaving(false);
    if (res.success) {
      setProfileNotice("Profile updated successfully!");
      setTimeout(() => setProfileNotice(null), 3500);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="clay-card p-8 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Loading Customer Portal...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3.5 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* ── Notification Banner (Re-Order / Cart Addition) ─────────────── */}
        {(reorderNotice || cartSuccessNotice) && (
          <div className="clay-card p-3.5 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">{reorderNotice || cartSuccessNotice}</span>
            </div>
            <Link
              href="/checkout"
              className="clay-btn-primary px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Checkout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ── 1. VIP Profile Clay Header ───────────────────────────────────── */}
        <div className="clay-card p-4 sm:p-7 relative overflow-hidden">
          {/* Subtle 3D background accent glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
            {/* User Identity */}
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <div className="w-13 h-13 sm:w-18 sm:h-18 shrink-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center text-xl sm:text-3xl font-black shadow-xl ring-2 sm:ring-4 ring-white/30 dark:ring-white/10">
                {(profile?.name || user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-2xl font-serif font-black text-foreground truncate max-w-full">
                    {profile?.name || user.displayName || "Valued Customer"}
                  </h1>
                  <span className="clay-badge px-2.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3 h-3" /> VIP Express
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-muted-foreground flex-wrap font-medium">
                  <span className="flex items-center gap-1 break-all max-w-full">
                    <Mail className="w-3 h-3 text-primary shrink-0" /> {user.email}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Phone className="w-3 h-3 text-primary shrink-0" /> {profile.phone}
                    </span>
                  )}
                  <span className="clay-badge px-2 py-0.5 bg-muted text-muted-foreground text-[9px] sm:text-[10px] font-bold shrink-0">
                    Dubai 3-Hour Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="clay-pill px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-foreground hover:text-primary flex items-center justify-center gap-1.5 flex-1 md:flex-initial cursor-pointer"
                title="Refresh Order Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin text-primary" : ""}`} />
                <span>Sync Orders</span>
              </button>

              <button
                onClick={() => logout()}
                className="clay-pill px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 border-red-500/30 flex items-center justify-center gap-1.5 flex-1 md:flex-initial cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* ── 5 Quick Clay Stat Cards ────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border/50">
            {/* Total Orders */}
            <button
              onClick={() => setActiveTab("orders")}
              className="clay-card clay-card-interactive p-3.5 sm:p-5 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-muted-foreground truncate">
                  Total Orders
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-foreground font-serif">
                {orders.length}
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                View history →
              </div>
            </button>

            {/* In-Transit Deliveries */}
            <button
              onClick={() => {
                setActiveTab("orders");
                setOrderFilter("to_receive");
              }}
              className="clay-card clay-card-interactive p-3.5 sm:p-5 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-muted-foreground truncate">
                  Active Delivery
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 relative group-hover:scale-110 transition-transform">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {activeOrders.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  )}
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-serif">
                {activeOrders.length}
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                {activeOrders.length > 0 ? "Express 3-Hour Dispatch" : "All delivered"}
              </div>
            </button>

            {/* Saved Wishlist */}
            <button
              onClick={() => setActiveTab("wishlist")}
              className="clay-card clay-card-interactive p-3.5 sm:p-5 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-muted-foreground truncate">
                  Saved Wishlist
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-rose-500/30" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-serif">
                {wishlistCount}
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                Saved favorites →
              </div>
            </button>

            {/* Coupons & Vouchers */}
            <button
              onClick={() => setActiveTab("coupons")}
              className="clay-card clay-card-interactive p-3.5 sm:p-5 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-muted-foreground truncate">
                  My Coupons
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-serif">
                {coupons.length}
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                Discounts & vouchers →
              </div>
            </button>

            {/* My Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="clay-card clay-card-interactive p-3.5 sm:p-5 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-muted-foreground truncate">
                  My Cart
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-foreground font-serif">
                {cartCount}
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                {cartCount > 0 ? `Dhs. ${cartTotal.toFixed(2)} →` : "View cart →"}
              </div>
            </button>
          </div>
        </div>

        {/* ── 2. Tactile Clay Pill Tabs Navigation ─────────────────────────── */}
        <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar touch-pan-x">
          {[
            { id: "overview", label: "Overview", icon: Zap },
            { id: "orders", label: `Orders (${orders.length})`, icon: Package },
            { id: "wishlist", label: `Wishlist (${wishlistCount})`, icon: Heart },
            { id: "coupons", label: `Coupons (${coupons.length})`, icon: Ticket },
            { id: "invoices", label: `Invoices (${orders.length})`, icon: FileText },
            { id: "addresses", label: `Addresses (${addresses.length})`, icon: MapPin },
            { id: "profile", label: "Profile", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`clay-pill px-3.5 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? "clay-pill-active scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-white" : "text-primary"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── 3. Tab Contents ─────────────────────────────────────────────── */}

        {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* ── My Orders Quick Status Bar with Animated Tracking Rail ──────── */}
            <div className="clay-card p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-foreground font-serif">
                    My Orders
                  </h3>
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderFilter("all");
                  }}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Order Micro-Tracker Strip (If customer has orders) */}
              {trackingStageInfo.order && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        trackingStageInfo.isCancelled ? "bg-red-500 animate-pulse" : "bg-primary animate-ping"
                      }`}
                    />
                    <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                      <span>Live Order </span>
                      <span className="font-mono text-primary font-black">#{trackingStageInfo.order.orderId}</span>
                      <span className="text-muted-foreground mx-1.5">•</span>
                      <span className={trackingStageInfo.isCancelled ? "text-red-600 font-black" : "text-foreground font-black"}>
                        {trackingStageInfo.isCancelled
                          ? "Order Cancelled"
                          : trackingStageInfo.order.statusLabel || "Order in Progress"}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-normal ml-2 hidden md:inline">
                        ({trackingStageInfo.order.lineItems?.length || 1} items • Dhs. {Number(trackingStageInfo.order.totalPrice || 0).toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTrackerOrder(trackingStageInfo.order)}
                    className="clay-pill px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary hover:bg-primary/15 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    <span>Track Order</span>
                  </button>
                </div>
              )}

              {/* ── Tracking Rail & Steps Container ── */}
              <div className="relative pt-2 pb-1">
                {/* Visual Tracking Rod / Rail (Passes behind icon centers) */}
                <div className="absolute top-[28px] sm:top-[38px] left-[10%] right-[10%] -translate-y-1/2 pointer-events-none z-0">
                  {/* Track Groove */}
                  <div className="w-full h-2 sm:h-2.5 bg-muted/90 dark:bg-muted/40 rounded-full border border-border/60 shadow-inner overflow-hidden relative">
                    {/* Animated Progress Fill Bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                        trackingStageInfo.isCancelled
                          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                          : "bg-gradient-to-r from-amber-500 via-primary to-emerald-500 shadow-[0_0_14px_rgba(232,82,26,0.5)]"
                      }`}
                      style={{ width: `${trackingStageInfo.percent}%` }}
                    >
                      {/* Flowing Shimmer Light Pulse */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
                    </div>
                  </div>

                  {/* Pulsing Runner Bead at Active Milestone */}
                  {trackingStageInfo.order && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out z-10"
                      style={{ left: `${trackingStageInfo.percent}%` }}
                    >
                      <span
                        className={`block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-card shadow-md ${
                          trackingStageInfo.isCancelled ? "bg-red-500" : "bg-primary"
                        }`}
                      />
                      <span
                        className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                          trackingStageInfo.isCancelled ? "bg-red-500" : "bg-primary"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* 5 Status Step Buttons Grid */}
                <div className="grid grid-cols-5 gap-1 sm:gap-3 text-center relative z-10">
                  {/* 1. Order Received */}
                  {(() => {
                    const isActive = trackingStageInfo.activeIndex === 0;
                    const isCompleted = trackingStageInfo.activeIndex >= 0;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("orders");
                          setOrderFilter("order_received");
                        }}
                        className="flex flex-col items-center group cursor-pointer p-1 sm:p-2.5 rounded-2xl hover:bg-muted/30 transition-all"
                      >
                        <div className="relative mb-2">
                          <div
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all relative ${
                              isActive
                                ? "bg-amber-500 text-white shadow-lg ring-4 ring-amber-500/30 scale-105 sm:scale-110"
                                : isCompleted
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-md group-hover:bg-amber-500 group-hover:text-white"
                                : "bg-card border-2 border-border/60 text-muted-foreground/60 shadow-sm"
                            }`}
                          >
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            {isActive && (
                              <span className="absolute inset-0 rounded-2xl bg-amber-500/25 animate-ping -z-10" />
                            )}
                          </div>
                          {orderCounts.received > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#ff3b30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm animate-pulse z-20">
                              {orderCounts.received}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold leading-tight transition-colors ${
                            isActive
                              ? "text-amber-600 dark:text-amber-400 font-black"
                              : "text-foreground group-hover:text-amber-600"
                          }`}
                        >
                          Order Received
                        </span>
                      </button>
                    );
                  })()}

                  {/* 2. Order Confirmed */}
                  {(() => {
                    const isActive = trackingStageInfo.activeIndex === 1;
                    const isCompleted = trackingStageInfo.activeIndex >= 1 && !trackingStageInfo.isCancelled;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("orders");
                          setOrderFilter("confirmed");
                        }}
                        className="flex flex-col items-center group cursor-pointer p-1 sm:p-2.5 rounded-2xl hover:bg-muted/30 transition-all"
                      >
                        <div className="relative mb-2">
                          <div
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all relative ${
                              isActive
                                ? "bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-500/30 scale-105 sm:scale-110"
                                : isCompleted
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-md group-hover:bg-emerald-500 group-hover:text-white"
                                : "bg-card border-2 border-border/60 text-muted-foreground/60 shadow-sm"
                            }`}
                          >
                            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                            {isActive && (
                              <span className="absolute inset-0 rounded-2xl bg-emerald-500/25 animate-ping -z-10" />
                            )}
                          </div>
                          {orderCounts.confirmed > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#ff3b30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm z-20">
                              {orderCounts.confirmed}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold leading-tight transition-colors ${
                            isActive
                              ? "text-emerald-600 dark:text-emerald-400 font-black"
                              : "text-foreground group-hover:text-emerald-600"
                          }`}
                        >
                          Order Confirmed
                        </span>
                      </button>
                    );
                  })()}

                  {/* 3. To Receive */}
                  {(() => {
                    const isActive = trackingStageInfo.activeIndex === 2;
                    const isCompleted = trackingStageInfo.activeIndex >= 2 && !trackingStageInfo.isCancelled;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("orders");
                          setOrderFilter("to_receive");
                        }}
                        className="flex flex-col items-center group cursor-pointer p-1 sm:p-2.5 rounded-2xl hover:bg-muted/30 transition-all"
                      >
                        <div className="relative mb-2">
                          <div
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all relative ${
                              isActive
                                ? "bg-primary text-white shadow-lg ring-4 ring-primary/30 scale-105 sm:scale-110"
                                : isCompleted
                                ? "bg-primary/15 text-primary border border-primary/30 shadow-md group-hover:bg-primary group-hover:text-white"
                                : "bg-card border-2 border-border/60 text-muted-foreground/60 shadow-sm"
                            }`}
                          >
                            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                            {isActive && (
                              <span className="absolute inset-0 rounded-2xl bg-primary/25 animate-ping -z-10" />
                            )}
                          </div>
                          {orderCounts.toReceive > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#ff3b30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm z-20">
                              {orderCounts.toReceive}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold leading-tight transition-colors ${
                            isActive
                              ? "text-primary font-black"
                              : "text-foreground group-hover:text-primary"
                          }`}
                        >
                          To Receive
                        </span>
                      </button>
                    );
                  })()}

                  {/* 4. Delivered */}
                  {(() => {
                    const isActive = trackingStageInfo.activeIndex === 3;
                    const isCompleted = trackingStageInfo.activeIndex >= 3 && !trackingStageInfo.isCancelled;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("orders");
                          setOrderFilter("delivered");
                        }}
                        className="flex flex-col items-center group cursor-pointer p-1 sm:p-2.5 rounded-2xl hover:bg-muted/30 transition-all"
                      >
                        <div className="relative mb-2">
                          <div
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all relative ${
                              isActive
                                ? "bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-600/30 scale-105 sm:scale-110"
                                : isCompleted
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-md group-hover:bg-emerald-600 group-hover:text-white"
                                : "bg-card border-2 border-border/60 text-muted-foreground/60 shadow-sm"
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            {isActive && (
                              <span className="absolute inset-0 rounded-2xl bg-emerald-600/25 animate-ping -z-10" />
                            )}
                          </div>
                          {orderCounts.delivered > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#ff3b30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm z-20">
                              {orderCounts.delivered}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold leading-tight transition-colors ${
                            isActive
                              ? "text-emerald-600 dark:text-emerald-400 font-black"
                              : "text-foreground group-hover:text-emerald-600"
                          }`}
                        >
                          Delivered
                        </span>
                      </button>
                    );
                  })()}

                  {/* 5. Returns / Cancelled */}
                  {(() => {
                    const isActive = trackingStageInfo.activeIndex === 4;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("orders");
                          setOrderFilter("returns");
                        }}
                        className="flex flex-col items-center group cursor-pointer p-1 sm:p-2.5 rounded-2xl hover:bg-muted/30 transition-all"
                      >
                        <div className="relative mb-2">
                          <div
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all relative ${
                              isActive
                                ? "bg-red-600 text-white shadow-lg ring-4 ring-red-500/30 scale-105 sm:scale-110"
                                : orderCounts.returns > 0
                                ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 shadow-md group-hover:bg-red-600 group-hover:text-white"
                                : "bg-card border-2 border-border/60 text-muted-foreground/60 shadow-sm"
                            }`}
                          >
                            {isActive ? (
                              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                            {isActive && (
                              <span className="absolute inset-0 rounded-2xl bg-red-600/25 animate-ping -z-10" />
                            )}
                          </div>
                          {orderCounts.returns > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#ff3b30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm z-20">
                              {orderCounts.returns}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold leading-tight transition-colors ${
                            isActive
                              ? "text-red-600 dark:text-red-400 font-black"
                              : "text-foreground group-hover:text-red-500"
                          }`}
                        >
                          {isActive ? "Order Cancelled" : "Returns"}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* ── My Coupons Quick Banner in Overview ────────────────────────── */}
            <div className="clay-card p-4 sm:p-6 bg-gradient-to-r from-amber-500/10 via-primary/10 to-orange-500/10 border border-primary/25 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 relative z-10">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-primary text-white flex items-center justify-center shadow-lg shrink-0 mt-0.5 sm:mt-0">
                    <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-foreground font-serif">
                        Exclusive Coupons & Vouchers
                      </h3>
                      <span className={`clay-badge px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        coupons.length > 0
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {coupons.length > 0 ? `${coupons.length} Ready to Use` : "0 Active"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {coupons.length > 0 ? (
                        <>
                          Use code{" "}
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupons[0].code)}
                            className="font-mono font-black text-primary bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            {coupons[0].code}
                          </button>{" "}
                          for {coupons[0].discount}.
                        </>
                      ) : (
                        "No coupons active at the moment. Have a promo code? Enter it to redeem instant discounts."
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("coupons")}
                  className="clay-btn-primary w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap text-center"
                >
                  <span>View Vouchers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Live Tracking Hero Banner if active orders exist */}
            {activeOrders.length > 0 && (
              <div className="clay-card p-5 sm:p-8 bg-gradient-to-br from-card via-card to-primary/5 border border-primary/30 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 clay-badge px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Order in Transit
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-foreground">
                      Order #{activeOrders[0].orderId} is on the way!
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                      Dubai 3-Hour Express Dispatch. Our rider is coordinating delivery to{" "}
                      <span className="font-bold text-foreground">
                        {activeOrders[0].shippingAddress?.city || "Dubai"}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    <button
                      onClick={() => setSelectedTrackerOrder(activeOrders[0])}
                      className="clay-btn-primary w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap text-center"
                    >
                      <Truck className="w-4 h-4 shrink-0" />
                      <span>Live 4-Step Tracker</span>
                    </button>
                    <a
                      href="https://wa.me/971582839787"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clay-pill w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-500/10 whitespace-nowrap text-center"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                      <span>WhatsApp Courier</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ── Saved Cart in Account ───────────────────────────────────────── */}
            {cart.length > 0 && (
              <div className="clay-card p-4 sm:p-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-border/50">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-foreground font-serif leading-snug">
                          My Saved Cart Items
                        </h3>
                        <span className="clay-badge px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Synced to Account
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cartCount} items saved in your account • Subtotal:{" "}
                        <strong className="text-foreground font-mono">Dhs. {cartTotal.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(true)}
                      className="clay-pill w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-foreground hover:text-primary cursor-pointer text-center justify-center whitespace-nowrap flex items-center"
                    >
                      View Cart Drawer
                    </button>
                    <Link
                      href="/checkout"
                      className="clay-btn-primary w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap text-center"
                    >
                      <span>Checkout (Dhs. {cartTotal.toFixed(2)})</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  </div>
                </div>

                {/* Items Horizontal Scroll / Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="clay-inset p-3 rounded-2xl flex items-center gap-3"
                    >
                      <div className="relative w-14 h-14 rounded-xl bg-card overflow-hidden shrink-0 border border-border/40">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-muted-foreground">
                            Qty: <strong className="text-foreground">{item.quantity}</strong>
                          </span>
                          <span className="font-mono font-black text-primary">
                            Dhs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Grid: Recent Orders & Wishlist Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Orders Preview */}
              <div className="clay-card p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif font-black text-foreground">Recent Orders</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all ({orders.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-foreground">No orders placed yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Explore our premium vape selection with same-day Dubai express delivery.
                    </p>
                    <Link
                      href="/shop"
                      className="clay-btn-primary px-5 py-2 text-xs font-black uppercase tracking-wider inline-flex mt-4"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.orderId}
                        className="clay-inset p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-foreground">
                              #{order.orderId}
                            </span>
                            {(() => {
                              const badge = getOrderStatusBadge(order.status, order.statusLabel);
                              return (
                                <span className={`clay-badge px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${badge.className}`}>
                                  {badge.label}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {order.lineItems?.length || 0} items • Dhs. {Number(order.totalPrice || 0).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(order)}
                            className="clay-pill px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Re-Order</span>
                          </button>
                          <button
                            onClick={() => setSelectedTrackerOrder(order)}
                            className="clay-btn-primary px-3 py-1.5 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Track</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist Highlights */}
              <div className="clay-card p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                    <h3 className="text-lg font-serif font-black text-foreground">Wishlist Favorites</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all ({wishlistCount})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-foreground">Your wishlist is empty</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Save products by tapping the heart icon on any vape item.
                    </p>
                    <Link
                      href="/shop"
                      className="clay-btn-primary px-5 py-2 text-xs font-black uppercase tracking-wider inline-flex mt-4"
                    >
                      Browse Vapes
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {wishlist.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="clay-inset p-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image || "/Vape%20Shop%20Dubai%20logo%201.png"}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-card p-1 shadow-sm flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.handle}`}
                              className="text-xs font-bold text-foreground hover:text-primary truncate block"
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs font-black text-primary mt-0.5">
                              Dhs. {item.price}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAddWishlistToCart(item)}
                            className="clay-btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="clay-pill p-2 text-muted-foreground hover:text-rose-500 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ORDERS & TRACKING ───────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filter and Search Bar */}
            <div className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
                {[
                  { id: "all", label: `All (${orders.length})` },
                  { id: "order_received", label: `Order Received (${orderCounts.received})` },
                  { id: "confirmed", label: `Order Confirmed (${orderCounts.confirmed})` },
                  { id: "to_receive", label: `To Receive (${orderCounts.toReceive})` },
                  { id: "delivered", label: `Delivered (${orderCounts.delivered})` },
                  { id: "returns", label: `Returns (${orderCounts.returns})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderFilter(f.id as any)}
                    className={`clay-pill px-3.5 sm:px-4 py-2 text-xs font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                      orderFilter === f.id
                        ? "clay-pill-active"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Orders */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order ID or item..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="clay-inset w-full sm:w-64 pl-9 pr-4 py-2 text-xs outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="clay-card p-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-muted-foreground">Loading order history...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="clay-card p-12 text-center space-y-4">
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-foreground">
                  {orderFilter === "to_pay"
                    ? "No orders waiting for payment"
                    : orderFilter === "to_ship"
                    ? "No orders waiting to ship"
                    : orderFilter === "to_receive"
                    ? "No orders currently out for delivery"
                    : orderFilter === "to_review"
                    ? "No delivered orders pending review"
                    : orderFilter === "returns"
                    ? "No returned or cancelled orders"
                    : "No orders found"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {orderSearchQuery
                    ? `No orders matching "${orderSearchQuery}".`
                    : orderFilter !== "all"
                    ? "Check your other status tabs or browse our store."
                    : "You haven't placed any orders yet."}
                </p>
                {orderFilter !== "all" ? (
                  <button
                    onClick={() => setOrderFilter("all")}
                    className="clay-btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider inline-flex cursor-pointer"
                  >
                    View All Orders
                  </button>
                ) : (
                  <Link
                    href="/shop"
                    className="clay-btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider inline-flex"
                  >
                    Browse Store
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const items = order.lineItems || [];
                  const isDelivered = (order.status || "").toLowerCase() === "delivered";
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-AE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Recent";

                  return (
                    <div key={order.orderId} className="clay-card p-6 sm:p-7 space-y-5">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm sm:text-base font-black text-foreground">
                                #{order.orderId}
                              </span>
                              {(() => {
                                const badge = getOrderStatusBadge(order.status, order.statusLabel);
                                return (
                                  <span className={`clay-badge px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badge.className}`}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3" /> Placed on {orderDate}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons on header */}
                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                          <button
                            onClick={() => setSelectedTrackerOrder(order)}
                            className="clay-pill px-2.5 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold text-foreground hover:text-primary flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Track</span>
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="clay-pill px-2.5 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold text-foreground hover:text-primary flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Invoice</span>
                          </button>

                          <button
                            onClick={() => handleReorder(order)}
                            className="clay-btn-primary px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                            <span>Re-Order</span>
                          </button>
                        </div>
                      </div>

                      {/* Items Thumbnails & Quantities */}
                      <div className="divide-y divide-border/30">
                        {items.map((it: any, idx: number) => {
                          const displayTitle =
                            it.title && it.title.toLowerCase().trim() !== "vape product"
                              ? it.title
                              : it.handle
                              ? it.handle.split("-").map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
                              : it.name || "Authentic Vape Product";

                          return (
                            <div key={idx} className="py-3 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={it.image || "/Vape%20Shop%20Dubai%20logo%201.png"}
                                  alt={displayTitle}
                                  onError={(e) => {
                                    e.currentTarget.src = "/Vape%20Shop%20Dubai%20logo%201.png";
                                  }}
                                  className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-card p-1 shadow-sm flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                    {displayTitle}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Quantity: <span className="font-bold text-foreground">{it.quantity || 1}</span>
                                    {it.variantTitle && it.variantTitle !== "Default Title" && ` • ${it.variantTitle}`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs sm:text-sm font-black text-foreground whitespace-nowrap">
                                Dhs. {Number(it.price || 0).toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Footer Summary */}
                      <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-muted/20 -mx-4 sm:-mx-7 -mb-4 sm:-mb-7 p-4 sm:p-6 rounded-b-[1.5rem] sm:rounded-b-[2rem]">
                        <div className="text-muted-foreground">
                          <span className="font-bold text-foreground">Delivery to: </span>
                          {order.shippingAddress?.address1
                            ? `${order.shippingAddress.address1}, ${order.shippingAddress.city}`
                            : order.shippingAddress?.city || "UAE Delivery"}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-muted-foreground text-right">
                            <span className="block text-[10px] uppercase font-bold tracking-wider">
                              Grand Total
                            </span>
                            <span className="text-base sm:text-lg font-black text-primary font-mono">
                              Dhs. {Number(order.totalPrice || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: WISHLIST (FEATURE-RICH) ─────────────────────────────── */}
        {activeTab === "wishlist" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-black text-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" /> My Saved Wishlist
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep track of products you love. Add them to your cart with a single click.
                </p>
              </div>

              {wishlist.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      wishlist.forEach((item) => handleAddWishlistToCart(item));
                    }}
                    className="clay-btn-primary px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add All to Cart</span>
                  </button>
                </div>
              )}
            </div>

            {wishlist.length === 0 ? (
              <div className="clay-card p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground">Your Wishlist is Empty</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Browse through top disposable vapes, pod systems, and e-liquids and click the heart icon to save items here!
                </p>
                <Link
                  href="/shop"
                  className="clay-btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider inline-flex"
                >
                  Explore Best-Sellers
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="clay-card clay-card-interactive p-5 flex flex-col justify-between group relative"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      type="button"
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 text-muted-foreground hover:text-rose-500 flex items-center justify-center shadow-md cursor-pointer transition-colors z-10"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      {/* Thumbnail */}
                      <Link
                        href={`/products/${item.handle}`}
                        className="block aspect-square rounded-2xl bg-white dark:bg-card/50 p-4 mb-4 relative overflow-hidden group-hover:scale-105 transition-transform"
                      >
                        <img
                          src={item.image || "/Vape%20Shop%20Dubai%20logo%201.png"}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </Link>

                      {/* Info */}
                      <div className="space-y-1">
                        {item.category && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                            {item.category}
                          </span>
                        )}
                        <Link
                          href={`/products/${item.handle}`}
                          className="text-xs sm:text-sm font-bold text-foreground hover:text-primary line-clamp-2 block"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base font-black text-foreground font-mono">
                          Dhs. {item.price}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="block text-[10px] text-muted-foreground line-through">
                            Dhs. {item.originalPrice}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddWishlistToCart(item)}
                        className="clay-btn-primary px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: MY COUPONS & PROMO VOUCHERS ──────────────────────────── */}
        {activeTab === "coupons" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Coupons Header Card */}
            <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-black text-foreground flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-500" /> My Coupons & Vouchers
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Redeem exclusive discounts, free express 3-hour Dubai shipping codes, and VIP pod rewards.
                </p>
              </div>

              <span className="clay-badge px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>{coupons.length} Active Vouchers</span>
              </span>
            </div>

            {/* Voucher Claim Box */}
            <div className="clay-card p-5 sm:p-6 bg-card">
              <form onSubmit={handleClaimPromo} className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-primary" />
                  <span>Have a Promo Code or Voucher?</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. VAPE20, DUBAI10)..."
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="clay-inset w-full pl-10 pr-4 py-2.5 text-xs uppercase font-mono tracking-wider font-bold text-foreground placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="clay-btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Claim Voucher</span>
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-xs font-bold mt-2 ${
                      promoMessage.type === "success"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500"
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </form>
            </div>

            {/* Coupons Grid or Empty State */}
            {coupons.length === 0 ? (
              <div className="clay-card p-12 text-center space-y-3">
                <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-foreground">No Active Coupons Right Now</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  There are currently no active vouchers. If you have received a promo discount code from our store or WhatsApp, you can claim it using the box above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {coupons.map((coupon) => {
                  const isCopied = copiedCode === coupon.code;
                  return (
                    <div
                      key={coupon.code}
                      className="clay-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all"
                    >
                      {/* Decorative Top Accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-orange-500" />

                      <div>
                        {/* Badge & Expiry Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="clay-badge px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider">
                            {coupon.badge || "Voucher"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expires {coupon.expiresAt}
                          </span>
                        </div>

                        {/* Main Discount & Title */}
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-2xl sm:text-3xl font-black font-serif text-primary tracking-tight">
                            {coupon.discount}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                            {coupon.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                          {coupon.description}
                        </p>

                        {/* Min Spend condition */}
                        {coupon.minSpend && (
                          <div className="text-[11px] text-muted-foreground font-medium mb-4 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Minimum order: <strong className="text-foreground">{coupon.minSpend}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Voucher Code Box & Actions */}
                      <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="clay-inset px-3.5 py-2 flex items-center justify-between gap-3 font-mono font-black text-xs text-foreground bg-muted/40">
                          <span className="tracking-widest">{coupon.code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-[11px] font-bold text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1"
                            title="Copy voucher code"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <Link
                          href="/shop"
                          className="clay-btn-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Shop Now</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* How to use vouchers info */}
            <div className="clay-inset p-5 sm:p-6 bg-muted/20 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>How to use promo vouchers</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click <strong>&quot;Copy&quot;</strong> on any voucher above, then apply it in your shopping cart or checkout note. Free express delivery discounts apply automatically on orders meeting minimum spend across Dubai, Sharjah, and Ajman.
              </p>
            </div>
          </div>
        )}

        {/* ─── TAB 5: ORDER INVOICES & RECEIPTS ───────────────────────────── */}
        {activeTab === "invoices" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-black text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> Order Invoices & Receipts
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Official purchase invoices and delivery receipts for all your Vape Shop Dubai orders.
                </p>
              </div>

              <span className="clay-badge px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
                Official Purchase Receipts
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="clay-card p-12 text-center space-y-3">
                <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-foreground">No Order Invoices Available</h3>
                <p className="text-xs text-muted-foreground">
                  Order invoices and receipts will appear here after placing an order.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 gap-3.5 md:hidden">
                  {orders.map((order) => {
                    const total = Number(order.totalPrice || 0);
                    const date = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-AE")
                      : "N/A";

                    return (
                      <div key={order.orderId} className="clay-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-foreground">
                            INV-{order.orderId}
                          </span>
                          <span className={`clay-badge px-2 py-0.5 text-[10px] font-bold ${
                            (order.status || "").toLowerCase().includes("cancel")
                              ? "bg-red-500/15 text-red-600 border border-red-500/30"
                              : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                          }`}>
                            {(order.status || "").toLowerCase().includes("cancel") ? "Cancelled" : (order.statusLabel || "Confirmed")}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/40">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Date</span>
                            <span className="font-medium text-foreground">{date}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">Total Amount</span>
                            <span className="font-black text-primary">
                              Dhs. {total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="clay-btn-primary w-full py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View / Print Invoice</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="clay-card overflow-hidden hidden md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="py-4 px-6">Invoice #</th>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6">Items</th>
                          <th className="py-4 px-6">Total Amount</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {orders.map((order) => {
                          const total = Number(order.totalPrice || 0);
                          const date = order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-AE")
                            : "N/A";

                          return (
                            <tr key={order.orderId} className="hover:bg-muted/20 transition-colors">
                              <td className="py-4 px-6 font-mono font-bold text-foreground">
                                INV-{order.orderId}
                              </td>
                              <td className="py-4 px-6 text-muted-foreground">{date}</td>
                              <td className="py-4 px-6 font-mono text-muted-foreground">
                                {order.lineItems?.length || 1} items
                              </td>
                              <td className="py-4 px-6 font-mono font-black text-foreground">
                                Dhs. {total.toFixed(2)}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`clay-badge px-2.5 py-0.5 text-[10px] font-bold ${
                                  (order.status || "").toLowerCase().includes("cancel")
                                    ? "bg-red-500/15 text-red-600 border border-red-500/30"
                                    : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                                }`}>
                                  {(order.status || "").toLowerCase().includes("cancel") ? "Cancelled" : (order.statusLabel || "Confirmed")}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => setSelectedInvoiceOrder(order)}
                                  className="clay-pill px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>View / Print</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 5: SAVED ADDRESSES ─────────────────────────────────────── */}
        {activeTab === "addresses" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-black text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> UAE Address Book
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage your delivery destinations across Dubai, Abu Dhabi, Sharjah, and other Emirates.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    fullName: profile?.name || "",
                    phone: profile?.phone || "+971 ",
                    emirate: "Dubai",
                    city: "Dubai",
                    addressLine1: "",
                    villaOrApt: "",
                    isDefault: addresses.length === 0,
                  });
                  setIsAddressModalOpen(true);
                }}
                className="clay-btn-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Delivery Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="clay-card p-12 text-center space-y-3">
                <MapPin className="w-14 h-14 text-muted-foreground/30 mx-auto" />
                <h3 className="text-base font-serif font-bold text-foreground">No saved addresses</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Save your home or work address for faster 1-click checkout with Dubai 3-Hour Express delivery.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`clay-card p-6 flex flex-col justify-between relative ${
                      addr.isDefault ? "ring-2 ring-primary/60" : ""
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="clay-badge absolute top-4 right-4 px-2.5 py-0.5 bg-primary text-white text-[10px] font-black uppercase tracking-wider">
                        Default
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-black text-foreground">{addr.fullName}</h4>
                      </div>

                      <p className="text-xs text-foreground font-medium">
                        {addr.addressLine1}
                        {addr.villaOrApt && `, Apt/Villa ${addr.villaOrApt}`}
                      </p>

                      <p className="text-xs text-muted-foreground font-bold">
                        {addr.emirate}, United Arab Emirates
                      </p>

                      {addr.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-primary" /> {addr.phone}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-primary hover:underline font-bold text-[11px] cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-bold">Default Address</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAddress(addr)}
                          className="clay-pill px-3 py-1 font-bold text-foreground hover:text-primary cursor-pointer text-[11px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="clay-pill p-1.5 text-muted-foreground hover:text-red-500 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 6: ACCOUNT PROFILE & SECURITY ─────────────────────────── */}
        {activeTab === "profile" && (
          <div className="clay-card p-6 sm:p-8 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-serif font-black text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile & Security Settings
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Manage your personal contact details and password preferences.
              </p>
            </div>

            {profileNotice && (
              <div className="clay-card p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{profileNotice}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Tariq Al-Mansoori"
                  className="clay-inset w-full px-4 py-3 text-xs sm:text-sm outline-none text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || ""}
                  className="clay-inset w-full px-4 py-3 text-xs sm:text-sm outline-none text-muted-foreground cursor-not-allowed opacity-75"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Verified Google / Email authentication
                </span>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
                  UAE Mobile Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. +971 50 123 4567"
                  className="clay-inset w-full px-4 py-3 text-xs sm:text-sm outline-none text-foreground font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="clay-btn-primary w-full py-3.5 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {profileSaving ? "Saving Updates..." : "Save Profile Details"}
              </button>
            </form>

            <div className="pt-6 border-t border-border/50 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                Security & Password
              </h4>
              <p className="text-xs text-muted-foreground">
                Need to update your password? Click below to receive a secure reset link to your email.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (user.email) {
                    await resetPassword(user.email);
                    setProfileNotice(`Password reset link sent to ${user.email}!`);
                    setTimeout(() => setProfileNotice(null), 5000);
                  }
                }}
                className="clay-pill px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer"
              >
                Send Password Reset Email
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Tax Invoice Modal ─────────────────────────────────────────────── */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={selectedInvoiceOrder}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* ── Order Tracker Modal ───────────────────────────────────────────── */}
      {selectedTrackerOrder && (
        <OrderTrackerModal
          order={selectedTrackerOrder}
          isOpen={!!selectedTrackerOrder}
          onClose={() => setSelectedTrackerOrder(null)}
        />
      )}

      {/* ── Address Add/Edit Modal ────────────────────────────────────────── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="clay-card w-full max-w-lg p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-5">
              <h3 className="text-lg font-serif font-black text-foreground">
                {editingAddress ? "Edit Delivery Address" : "Add UAE Delivery Address"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="clay-pill w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addressError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                {addressError}
              </div>
            )}

            <form onSubmit={handleAddressSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="e.g. Tariq Al-Mansoori"
                  className="clay-inset w-full px-3.5 py-2.5 text-xs outline-none text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  UAE Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+971 50 123 4567"
                  className="clay-inset w-full px-3.5 py-2.5 text-xs outline-none text-foreground font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Emirate *
                </label>
                <select
                  value={addressForm.emirate}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      emirate: e.target.value,
                      city: e.target.value,
                    })
                  }
                  className="clay-inset w-full px-3.5 py-2.5 text-xs outline-none text-foreground cursor-pointer"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Street / Building Details *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="e.g. Marina Heights Tower, Al Marsa St, Dubai Marina"
                  className="clay-inset w-full px-3.5 py-2.5 text-xs outline-none text-foreground resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                  Apartment / Villa Number
                </label>
                <input
                  type="text"
                  value={addressForm.villaOrApt}
                  onChange={(e) => setAddressForm({ ...addressForm, villaOrApt: e.target.value })}
                  placeholder="e.g. Apt 1402 / Villa 18"
                  className="clay-inset w-full px-3.5 py-2.5 text-xs outline-none text-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="default-address-cb"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded accent-primary cursor-pointer w-4 h-4"
                />
                <label
                  htmlFor="default-address-cb"
                  className="text-xs font-bold text-foreground cursor-pointer select-none"
                >
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="clay-pill px-4 py-2 font-bold text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="clay-btn-primary px-5 py-2 font-black uppercase tracking-wider cursor-pointer"
                >
                  {addressSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
