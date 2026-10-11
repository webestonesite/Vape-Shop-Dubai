"use client";

import React, { useRef } from "react";
import { X, Printer, ShieldCheck, Download, CheckCircle2 } from "lucide-react";

interface TaxInvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TaxInvoiceModal({ order, isOpen, onClose }: TaxInvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const lineItems = order.lineItems || [];
  const totalPrice = Number(order.totalPrice || 0);
  const subtotal = order.subtotal ? Number(order.subtotal) : Math.round((totalPrice / 1.05) * 100) / 100;
  const vatAmount = order.vatAmount ? Number(order.vatAmount) : Math.round((totalPrice - subtotal) * 100) / 100;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }) : "N/A";

  const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString("en-AE", {
    hour: "2-digit",
    minute: "2-digit",
  }) : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-3xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full">
        
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-foreground">
              Order Invoice • #{order.orderId || "Order"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-gold-shimmer text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div ref={printRef} className="p-6 sm:p-10 text-foreground bg-card print:p-8 print:bg-white print:text-black">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl sm:text-2xl font-black text-primary tracking-tight font-serif">
                  VAPE SHOP DUBAI
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground print:text-gray-600 font-medium">
                Licensed Vape & Pod Distributor • Dubai, United Arab Emirates
              </p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600 font-medium mt-0.5">
                Tax Registration Number (TRN): <span className="font-mono font-bold text-foreground print:text-black">100234892100003</span>
              </p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600 font-medium">
                Support: info@vapeshopdubai.com • WhatsApp: +971 58 283 9787
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1.5 print:border-black print:text-black">
                ORDER INVOICE / فاتورة الطلب
              </span>
              <p className="text-sm font-mono font-black text-foreground print:text-black">
                INV-{order.orderId?.replace("#", "") || "0000"}
              </p>
              <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                Date: <span className="font-bold text-foreground print:text-black">{orderDate} {orderTime}</span>
              </p>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                Payment: <span className="font-bold text-foreground print:text-black">{order.paymentMethod || "COD"}</span>
              </p>
            </div>
          </div>

          {/* Bill To / Ship To Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border/60 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground print:text-gray-600 block mb-1">
                Billed / Delivered To:
              </span>
              <p className="font-bold text-foreground print:text-black text-sm">
                {order.customerName || order.shippingAddress?.firstName || "Valued Customer"}
              </p>
              <p className="text-muted-foreground print:text-gray-700 mt-0.5">
                {order.shippingAddress?.address1 || "Dubai, UAE"}
              </p>
              <p className="text-muted-foreground print:text-gray-700">
                {order.shippingAddress?.city || "Dubai"}, United Arab Emirates
              </p>
              {order.customerPhone && (
                <p className="text-muted-foreground print:text-gray-700 font-mono mt-0.5">
                  Mobile: {order.customerPhone}
                </p>
              )}
              {order.customerEmail && (
                <p className="text-muted-foreground print:text-gray-700">
                  Email: {order.customerEmail}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground print:text-gray-600 block mb-1">
                Delivery Details:
              </span>
              <p className="font-bold text-foreground print:text-black">
                Dubai Express 3 Hours Delivery
              </p>
              <p className="text-muted-foreground print:text-gray-700 mt-0.5">
                Status: <span className="font-bold uppercase text-emerald-600">{order.statusLabel || order.status || "Confirmed"}</span>
              </p>
              <p className="text-muted-foreground print:text-gray-700 mt-0.5">
                Verification: 18+ Age Verified on Delivery
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 border-b border-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-[10px] font-black uppercase tracking-wider text-muted-foreground print:text-gray-700">
                  <th className="py-2.5 px-2 text-center w-8">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2 text-center w-12">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                  <th className="py-2.5 px-3 text-right w-24">Total (Dhs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {lineItems.map((item: any, idx: number) => {
                  const itemPrice = Number(item.price || 0);
                  const itemQty = Number(item.quantity || 1);
                  const itemTotal = itemPrice * itemQty;

                  return (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="py-3 px-2 text-center text-muted-foreground font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-foreground print:text-black block">
                          {item.title}
                        </span>
                        {item.variantTitle && item.variantTitle !== "Default Title" && (
                          <span className="text-[11px] text-muted-foreground print:text-gray-600">
                            Option: {item.variantTitle}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-bold font-mono">
                        {itemQty}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        Dhs. {itemPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-black font-mono text-foreground print:text-black">
                        Dhs. {itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals Calculation */}
          <div className="pt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="text-xs text-muted-foreground print:text-gray-600 space-y-1.5 max-w-sm">
              <div className="flex items-center gap-1.5 text-foreground print:text-black font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic Product Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Thank you for your business. Products purchased from Vape Shop Dubai are sealed original units with authentic security scratch codes.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground print:text-gray-700">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-mono font-semibold">Dhs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground print:text-gray-700">
                <span>UAE VAT (5%):</span>
                <span className="font-mono font-semibold">Dhs. {vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground print:text-gray-700">
                <span>Express Delivery:</span>
                <span className="font-mono font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="pt-2 border-t border-border/80 flex justify-between items-baseline text-sm font-black text-foreground print:text-black">
                <span>Total Payable:</span>
                <span className="text-lg font-mono text-primary print:text-black">
                  Dhs. {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Legal Note */}
          <div className="mt-8 pt-4 border-t border-border/40 text-center text-[10px] text-muted-foreground print:text-gray-500">
            Official purchase invoice & receipt for order #{order.orderId || ""}. Thank you for shopping with Vape Shop Dubai.
          </div>

        </div>
      </div>
    </div>
  );
}
