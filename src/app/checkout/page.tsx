"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  Mail,
  CreditCard, 
  DollarSign, 
  Loader2, 
  ShoppingBag,
  Info
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+971 ");
  const [city, setCity] = useState("Dubai");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [shippingType, setShippingType] = useState("standard");

  // UX states
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const isValidUAEPhone = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+971") && cleaned.length === 13) return true;
    if (cleaned.startsWith("05") && cleaned.length === 10) return true;
    return false;
  };
  const isPhoneInvalid = 
    phone.trim().length > 0 && 
    phone !== "+971" && 
    phone !== "+971 " && 
    !isValidUAEPhone(phone);

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };
  const isEmailInvalid = email.trim().length > 0 && !isValidEmail(email);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (val.startsWith("+971 ")) {
      setPhone(val);
    } else if (val === "+971") {
      // If they backspaced the space, restore it
      setPhone("+971 ");
    } else {
      // If they cleared it, pasted over it, or tried to delete the prefix
      const digits = val.replace(/[^\d]/g, "");
      let clean = digits;
      
      // Handle pasted numbers gracefully by stripping any existing country code / local zero
      if (clean.startsWith("971")) {
        clean = clean.substring(3);
      } else if (clean.startsWith("05")) {
        clean = clean.substring(1);
      }
      
      setPhone("+971 " + clean);
    }
  };

  // Enforce standard shipping if cart total drops below 300
  useEffect(() => {
    if (cartTotal < 300 && shippingType === "free") {
      setShippingType("standard");
    }
  }, [cartTotal, shippingType]);

  // Prevent accessing checkout with empty cart
  useEffect(() => {
    // We only redirect if cart is empty after hydration has completed
    // (We wait briefly for localStorage to hydrate)
    const timeout = setTimeout(() => {
      if (cart.length === 0) {
        router.push("/");
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [cart, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Simple validation
    if (!name.trim()) {
      setFormError("Full Name is required.");
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setFormError("Phone Number is required.");
      return;
    }

    if (!isValidUAEPhone(cleanPhone)) {
      setFormError("Please enter a valid UAE phone number (e.g. +971 50 123 4567).");
      return;
    }

    if (email.trim().length > 0 && !isValidEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!address.trim()) {
      setFormError("Delivery Address is required.");
      return;
    }

    setLoading(true);

    try {
      // Map cart items for API payload
      const lineItems = cart.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.name,
        price: item.price
      }));

      const payload = {
        shippingAddress: {
          firstName: name,
          email: email.trim(),
          phone: cleanPhone,
          address1: address,
          city: city,
        },
        paymentMethod: paymentMethod,
        lineItems: lineItems,
        shippingLine: {
          title: shippingType === "free" ? "Free Express Delivery" : "Standard Delivery",
          price: shippingType === "free" ? 0 : 30,
        }
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (data.errors && data.errors[0]?.message) || "Failed to place order");
      }

      if (data.success) {
        clearCart();
        router.push(`/checkout/success?order=${encodeURIComponent(data.orderName)}`);
      } else {
        throw new Error("Order creation was not successful");
      }

    } catch (err: any) {
      console.error("Order submission error:", err);
      setFormError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="relative flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Preparing checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 pt-24 sm:pt-32">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8">Secure Checkout</h1>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form details */}
          <div className="lg:col-span-7 bg-card border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Information
            </h2>

            {formError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex gap-2 items-start">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3 w-3" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Al-Mansoori"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-background border border-border/60 hover:border-primary/50 focus:border-primary rounded-xl px-4 py-3 text-xs outline-none text-foreground transition-all"
                />
              </div>

              {/* Email Address (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email Address <span className="text-[10px] font-normal text-muted-foreground">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={`w-full bg-background border ${
                    isEmailInvalid
                      ? "border-red-500 focus:border-red-600"
                      : "border-border/60 hover:border-primary/50 focus:border-primary"
                  } rounded-xl px-4 py-3 text-xs outline-none text-foreground transition-all`}
                />
                {isEmailInvalid && (
                  <span className="text-[10px] text-red-500 block font-semibold">
                    Please enter a valid email address.
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +971 50 123 4567"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  className={`w-full bg-background border ${
                    isPhoneInvalid
                      ? "border-red-500 focus:border-red-600"
                      : "border-border/60 hover:border-primary/50 focus:border-primary"
                  } rounded-xl px-4 py-3 text-xs outline-none text-foreground transition-all font-mono`}
                />
                {isPhoneInvalid ? (
                  <span className="text-[10px] text-red-500 block font-semibold">
                    Invalid format. Please enter a valid UAE number (e.g., +971 50 123 4567).
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground block">
                    Required for order verification call & delivery coordination.
                  </span>
                )}
              </div>

              {/* Emirate / City Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Emirate (City)
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  className="w-full bg-background border border-border/60 hover:border-primary/50 focus:border-primary rounded-xl px-4 py-3 text-xs outline-none text-foreground transition-all cursor-pointer"
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

              {/* Street Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Delivery Address Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Marina Heights Tower, Apt 1402, Dubai Marina"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  className="w-full bg-background border border-border/60 hover:border-primary/50 focus:border-primary rounded-xl px-4 py-3 text-xs outline-none text-foreground transition-all resize-none"
                />
              </div>

              {/* Shipping Method */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Shipping Method
                </label>
                
                <div className="flex flex-col gap-3">
                  <label className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                    shippingType === "standard"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-primary/50 bg-background"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Standard Delivery</p>
                        <p className="text-[10px] text-muted-foreground">30.00 AED</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="shippingType"
                      value="standard"
                      checked={shippingType === "standard"}
                      onChange={() => setShippingType("standard")}
                      className="accent-primary"
                    />
                  </label>

                  {cartTotal >= 300 && (
                    <label className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                      shippingType === "free"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/50 bg-background"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-xs font-bold text-foreground flex items-center gap-2">
                            Free Express Delivery 
                            <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Qualified</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">0.00 AED</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="shippingType"
                        value="free"
                        checked={shippingType === "free"}
                        onChange={() => setShippingType("free")}
                        className="accent-primary"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Payment Method
                </label>
                
                <div className="flex flex-col gap-2">
                  <label className="border border-primary bg-primary/5 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Cash on Delivery</p>
                        <p className="text-[10px] text-muted-foreground">Pay with Cash on receipt</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={true}
                      readOnly
                      className="accent-primary"
                    />
                  </label>
                  
                  <p className="text-[11px] text-yellow-600 font-bold px-2">
                    * Note: If Card or Link Payment then 5% VAT Required.
                  </p>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 bg-card border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Order Summary
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-border/40 max-h-72 overflow-y-auto mb-6 pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="h-14 w-14 bg-muted/40 rounded-xl flex items-center justify-center flex-shrink-0 border border-border overflow-hidden p-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-auto object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Quantity: {item.quantity}</p>
                    <p className="text-xs font-semibold text-primary mt-1 font-mono">{item.price} AED</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground font-mono">{(item.price * item.quantity).toLocaleString()} AED</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 pt-5 border-t border-border/40">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground font-semibold">{cartTotal.toLocaleString()} AED</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="text-primary font-bold uppercase tracking-wider text-[10px]">
                  {shippingType === "free" ? "Free Express Delivery" : "30.00 AED"}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-3 border-t border-border/40">
                <span>Total Amount</span>
                <span className="text-primary font-mono text-lg">{(cartTotal + (shippingType === "free" ? 0 : 30)).toLocaleString()} AED</span>
              </div>
              <div className="text-[11px] text-muted-foreground pt-4 pb-1 text-center leading-relaxed">
                By placing your order, you agree to our{" "}
                <Link href="/terms-conditions" className="text-primary hover:underline font-medium">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
              </div>
            </div>

            {/* Submit button */}
            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer hover:brightness-105 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing Order...
                </>
              ) : (
                <>Confirm and Place Order (COD)</>
              )}
            </button>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mt-6">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                ⚡ Lightning-Fast UAE Delivery
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Orders are processed instantly. Deliveries take within 2 hours in Dubai and same-day across other Emirates. COD payment can be made via Cash or Card on arrival.
              </p>
            </div>
          </div>

        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
