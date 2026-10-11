"use client";

import React, { useEffect } from "react";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  // Always close drawer on route change
  useEffect(() => {
    setIsCartOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
      document.documentElement.style.pointerEvents = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }, [pathname, setIsCartOpen]);

  // Ensure DOM styles are completely unlocked when drawer is closed
  useEffect(() => {
    if (!isCartOpen && typeof document !== "undefined") {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
      document.documentElement.style.pointerEvents = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }, [isCartOpen]);

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.pointerEvents = "auto";
        document.body.style.overflow = "auto";
        document.documentElement.style.pointerEvents = "auto";
        document.documentElement.style.overflow = "auto";
      }
    };
  }, []);

  // Generate WhatsApp message and redirect
  const handleWhatsAppCheckout = () => {
    const phone = "+971500000000"; // Shop WhatsApp number
    let message = "Hello Vape Shop Dubai, I would like to order:\n\n";

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (Qty: ${item.quantity}) - ${item.price * item.quantity} AED\n`;
    });

    message += `\n*Total Value:* ${cartTotal} AED`;
    message += `\n*Payment Mode:* Cash / Card on Delivery`;
    message += `\n\nPlease confirm my order and request delivery details.`;

    const encodedText = encodeURIComponent(message);
    const url = `https://wa.me/${phone.replace("+", "")}?text=${encodedText}`;
    window.open(url, "_blank");
  };

  // Route to custom checkout page and close cart drawer
  const handleShopifyCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
      document.documentElement.style.pointerEvents = "auto";
      document.documentElement.style.overflow = "auto";
    }
    // Small timeout ensures Base UI Dialog completes unmount and removes all modal locks before navigation
    setTimeout(() => {
      router.push("/checkout");
    }, 60);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card border-l border-border p-0 flex flex-col h-full text-foreground"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <SheetTitle className="text-base font-semibold tracking-wider uppercase text-foreground">
              Your Cart
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <ShoppingBag className="h-16 w-16 text-foreground/10 stroke-[1] mb-4" />
              <p className="text-sm text-foreground/90 font-medium">Your cart is empty</p>
              <p className="text-xs text-text-muted mt-1 max-w-xs">
                Explore our premium collection and add your favourite flavours.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 text-xs uppercase tracking-widest bg-gold text-primary-foreground font-bold px-5 py-2.5 rounded hover:bg-gold-shimmer transition-colors cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-background border border-border p-3 rounded-lg"
              >
                {/* Product image */}
                <div className="h-16 w-16 bg-card rounded flex items-center justify-center overflow-hidden flex-shrink-0 border border-border relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2 break-words whitespace-normal leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-gold font-medium mt-0.5">{item.price} AED</p>
                  
                  {/* Quantity modifiers */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-border rounded overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-text-muted hover:text-red transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-background space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-text-muted">
                <span>Subtotal</span>
                <span>{cartTotal} AED</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>Shipping</span>
                <span className="text-gold font-mono uppercase text-[10px]">Free Express Delivery</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-gold">{cartTotal} AED</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleShopifyCheckout}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-gold-shimmer text-white py-3.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer uppercase tracking-wider active:scale-95"
              >
                Checkout
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/cart");
                }}
                className="w-full flex items-center justify-center gap-2 bg-muted/40 hover:bg-muted text-foreground border border-border/80 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
              >
                View Cart Page
              </button>
              
              <div className="text-center pt-1">
                <span className="text-[10px] text-text-muted">
                  Same-day express delivery in 2 hours across Dubai
                </span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
