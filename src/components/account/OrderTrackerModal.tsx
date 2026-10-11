"use client";

import React from "react";
import {
  X,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Zap,
  XCircle,
} from "lucide-react";

interface OrderTrackerModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTrackerModal({ order, isOpen, onClose }: OrderTrackerModalProps) {
  if (!isOpen || !order) return null;

  const currentStatus = (order.status || "order_received").toLowerCase();
  const isCancelled =
    ["cancelled", "canceled", "refunded"].includes(currentStatus) ||
    (order.statusLabel || "").toLowerCase().includes("cancel");
  
  const isReceived = true;
  const isConfirmed = !isCancelled && ["confirmed", "in_progress", "processing", "to_receive", "shipped", "out_for_delivery", "fulfilled", "delivered"].includes(currentStatus);
  const isToReceive = !isCancelled && ["to_receive", "shipped", "out_for_delivery", "fulfilled", "delivered"].includes(currentStatus);
  const isDelivered = !isCancelled && currentStatus === "delivered";

  // Define 4 step progression: If cancelled, Step 2 becomes Order Cancelled
  const steps = [
    {
      id: "order_received",
      title: "Order Received",
      desc: "Order received via Web Store",
      icon: Clock,
      completed: isReceived,
      active: !isCancelled && (currentStatus === "order_received" || currentStatus === "placed"),
      isCancelled: false,
      disabled: false,
    },
    {
      id: isCancelled ? "cancelled" : "confirmed",
      title: isCancelled ? "Order Cancelled" : "Order Confirmed",
      desc: isCancelled ? "Order cancelled by store administrator" : "In Progress & verified at Dubai warehouse",
      icon: isCancelled ? XCircle : ShieldCheck,
      completed: true,
      active: isCancelled || (!isCancelled && (currentStatus === "confirmed" || currentStatus === "in_progress" || currentStatus === "processing")),
      isCancelled: isCancelled,
      disabled: false,
    },
    {
      id: "to_receive",
      title: "To Receive",
      desc: isCancelled ? "Delivery cancelled" : "Fulfilled & out for express 3-hour courier delivery",
      icon: Truck,
      completed: isToReceive,
      active: !isCancelled && (currentStatus === "to_receive" || currentStatus === "out_for_delivery" || currentStatus === "shipped" || currentStatus === "fulfilled"),
      isCancelled: false,
      disabled: isCancelled,
    },
    {
      id: "delivered",
      title: "Order Delivered",
      desc: isCancelled ? "Delivery cancelled" : "Order safely received by customer",
      icon: CheckCircle2,
      completed: isDelivered,
      active: isDelivered,
      isCancelled: false,
      disabled: isCancelled,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/60 bg-muted/30">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary fill-primary/20" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Live Order Tracking
              </span>
            </div>
            <h3 className="text-lg font-serif font-black text-foreground mt-0.5">
              Order {order.orderId || "Details"}
            </h3>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Estimated Delivery / Status Banner */}
          <div
            className={`rounded-2xl p-4 flex items-center justify-between gap-3 border transition-colors ${
              isCancelled
                ? "bg-red-500/10 border-red-500/30"
                : "bg-primary/10 border-primary/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm ${
                  isCancelled ? "bg-red-600" : "bg-primary"
                }`}
              >
                {isCancelled ? <XCircle className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
              </div>
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider block ${
                    isCancelled ? "text-red-600" : "text-primary"
                  }`}
                >
                  {isCancelled ? "Order Status: Cancelled" : "Delivery Speed: Express 3 Hours"}
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-foreground">
                  {isCancelled
                    ? "This order was cancelled from backend."
                    : isDelivered
                    ? "Order successfully delivered & received!"
                    : isToReceive
                    ? "Driver is on the way with your package"
                    : isConfirmed
                    ? "Order confirmed - preparing package for immediate dispatch"
                    : "Order received - awaiting confirmation"}
                </p>
              </div>
            </div>

            <span
              className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full text-white shrink-0 shadow-xs ${
                isCancelled ? "bg-red-600" : "bg-primary"
              }`}
            >
              {isCancelled ? "Cancelled" : (order.statusLabel || order.status || "In Transit")}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className={`relative flex items-start gap-4 ${step.disabled ? "opacity-35" : ""}`}>
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                      step.isCancelled
                        ? "bg-red-600 border-red-600 text-white shadow-xs"
                        : step.completed
                        ? "bg-primary border-primary text-white shadow-xs"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    {step.isCancelled ? "✕" : step.completed ? "✓" : idx + 1}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          step.isCancelled
                            ? "text-red-600 dark:text-red-400 font-black"
                            : step.completed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {step.active && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            step.isCancelled ? "bg-red-600" : "bg-primary"
                          } animate-ping`}
                        />
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${step.isCancelled ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Destination & Contact Card */}
          <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Delivery Destination
                </span>
                <p className="font-bold text-foreground">
                  {order.shippingAddress?.address1 || "Dubai, UAE"}, {order.shippingAddress?.city || "Dubai"}
                </p>
              </div>
            </div>

            {order.customerPhone && (
              <div className="flex items-center gap-2.5 pt-2 border-t border-border/40">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground font-mono">
                  Recipient Contact: <strong className="text-foreground">{order.customerPhone}</strong>
                </span>
              </div>
            )}

            {order.customerNote && (
              <div className="pt-2 border-t border-border/40 text-[11px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-0.5">
                  Customer Note / Instructions:
                </span>
                <p className="text-foreground italic">{order.customerNote}</p>
              </div>
            )}
          </div>

          {/* WhatsApp Instant Assistance */}
          <a
            href={`https://wa.me/971582839787?text=${encodeURIComponent(
              `Hello Vape Shop Dubai, I would like to check the status of my order ${order.orderId}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Chat with Dispatcher on WhatsApp (+971 58 283 9787)</span>
          </a>

        </div>
      </div>
    </div>
  );
}
