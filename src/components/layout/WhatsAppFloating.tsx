"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Bot, ShieldCheck, MessageCircle, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const WhatsAppFloating: React.FC = () => {
  // Mounted by the root layout, which also wraps the admin panel — the support
  // widget has no place over the theme customizer.
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "whatsapp">("ai");

  const [inputMessage, setInputMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! 👋 Welcome to Vape Shop Dubai.\n\nI'm your Sales Assistant. How can I help you today?\n\nWhich language do you prefer to chat in? (English / العربية / বাংলা / Русский / French)"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const dashboardRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && activeTab === "ai") {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 4000);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  // Close dashboard when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest(".whatsapp-floating-btn")) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSendAIMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const handleNewAssistantMessage = (content: string) => {
        setMessages((prev) => [...prev, { role: "assistant", content }]);
        playNotificationSound();
        setUnreadCount((prev) => prev + 1);
      };

      if (res.ok) {
        const data = await res.json();
        handleNewAssistantMessage(data.reply);
      } else {
        handleNewAssistantMessage("We offer ⚡ 2-Hour Express Delivery in Dubai for JUUL, Myle, and Disposables! Please reply with your required product or WhatsApp us at +971582839787.");
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "I am ready to take your order! 📦 What product & flavor would you like to order today?" }]);
      playNotificationSound();
      setUnreadCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppSend = (text?: string) => {
    const msg = text || "Hello Vape Shop Dubai! I would like to inquire about vape delivery and products.";
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/971582839787?text=${encoded}`, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const quickPrompts = [
    { text: "⚡ Delivery time & cost?", msg: "Delivery time and shipping cost in Dubai?" },
    { text: "🍇 JUUL 2 pod flavors?", msg: "JUUL 2 pod er available flavors & price koto?" },
    { text: "💨 Highest puff disposables?", msg: "Which disposable vape has highest puffs?" },
    { text: "📦 Place an order", msg: "I want to place an order now." },
  ];

  if (isAdminRoute) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* ── Chat Dashboard Window ── */}
      {isOpen && (
        <div
          ref={dashboardRef}
          className="mb-4 w-[340px] sm:w-[380px] h-[520px] bg-[#121214]/95 border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden flex flex-col animate-slide-up origin-bottom-right"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-primary via-primary/95 to-gold-shimmer p-4 text-white flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-primary animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm tracking-wide flex items-center gap-1.5">
                    Vape Shop Dubai
                  </h4>
                  <p className="text-[10px] text-white/80 flex items-center gap-1">
                    Powered by Webestone • 24/7 Live
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 bg-black/20 p-1 rounded-xl gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab("ai")}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "ai"
                  ? "bg-white text-foreground shadow-sm font-extrabold"
                  : "text-white/80 hover:text-white"
                  }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>LIVE CHAT</span>
              </button>

              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "whatsapp"
                  ? "bg-white text-foreground shadow-sm font-extrabold"
                  : "text-white/80 hover:text-white"
                  }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Tab 1: AI Assistant Chat */}
          {activeTab === "ai" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Message Thread */}
              <div className="flex-1 min-h-0 p-3.5 space-y-3.5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${m.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white/10 border border-white/15 text-primary"
                        }`}
                    >
                      {m.role === "user" ? "👤" : "🤖"}
                    </div>

                    <div
                      className={`rounded-2xl p-3 max-w-[85%] text-xs leading-relaxed ${m.role === "user"
                        ? "bg-primary text-white rounded-tr-none font-medium"
                        : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none"
                        }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {m.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                          part.match(/^https?:\/\//) ? (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline hover:text-amber-400 font-semibold break-all inline-flex items-center gap-1 my-0.5"
                            >
                              {part.includes("/collections/")
                                ? "📁 View Collection Page →"
                                : part.includes("/blog")
                                  ? "📰 Read Blog & Guides →"
                                  : (part.includes("/products/") || part.includes("/product/"))
                                    ? "🔗 Open Product Page →"
                                    : (part.length > 40 ? part.slice(0, 40) + '...' : part)}
                            </a>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </p>

                      {m.role === "assistant" && (
                        <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between gap-2">
                          <span className="text-[9px] text-zinc-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Sales Man
                          </span>
                          <span className="text-[9px] text-zinc-500">
                            vapeshopdubai.ae
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px]">
                      🤖
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Pills */}
              <div className="flex-shrink-0 w-full px-3 py-2 bg-zinc-950/80 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendAIMessage(q.msg)}
                    className="flex-shrink-0 whitespace-nowrap bg-white/5 hover:bg-primary/15 border border-white/10 hover:border-primary/30 text-[10px] font-semibold text-zinc-300 hover:text-primary px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    {q.text}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className="flex-shrink-0 p-3 border-t border-white/5 bg-zinc-950 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendAIMessage()}
                    placeholder="Ask about any product..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={() => handleSendAIMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-9 h-9 rounded-xl bg-primary hover:bg-gold-shimmer disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => { setActiveTab("whatsapp"); }}
                  className="text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <User className="w-3 h-3" /> Talk to a human instead →
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Direct WhatsApp */}
          {activeTab === "whatsapp" && (
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 text-2xl">
                    💬
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white">Direct WhatsApp Ordering</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Connect instantly with our Dubai sales team on WhatsApp. 2-Hour Express Delivery active!
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Quick WhatsApp Topics</p>
                  <button
                    onClick={() => handleWhatsAppSend("Hi! I want to order JUUL 2 Pods for express Dubai delivery.")}
                    className="w-full text-left bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 hover:text-emerald-400 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>🍇 Order JUUL 2 Pods</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppSend("Hi! I want to order Disposable Vapes (Al Fakher / Vozol / Geek Bar).")}
                    className="w-full text-left bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 hover:text-emerald-400 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>💨 Order Disposable Vapes</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppSend("Hello! Can I pay Cash on Delivery (COD) for my order?")}
                    className="w-full text-left bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 hover:text-emerald-400 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>💵 Inquire Cash on Delivery</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleWhatsAppSend()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open WhatsApp (+971 58 283 9787)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Floating Trigger Button ── */}
      <div className="flex items-center gap-3">
        {!isOpen && (
          <div
            className={`bg-zinc-950/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 transform origin-right ${showTooltip ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-75 pointer-events-none"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Need support ?
            </span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className="whatsapp-floating-btn relative w-14 h-14 rounded-full bg-primary hover:bg-gold-shimmer text-white flex items-center justify-center shadow-[0_4px_20px_rgba(232,82,26,0.35)] hover:shadow-[0_4px_25px_rgba(232,82,26,0.5)] hover:scale-[1.07] active:scale-95 transition-all duration-300 cursor-pointer group"
          aria-label="Toggle live chat assistant"
        >
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full border-2 border-primary/25 animate-ping pointer-events-none" />
          )}

          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
          ) : (
            <Bot className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
          )}

          {!isOpen && unreadCount > 0 ? (
            <span className="absolute top-0 right-0 flex h-5 w-5 -translate-y-1 translate-x-1 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow ring-2 ring-primary animate-bounce">
              {unreadCount}
            </span>
          ) : !isOpen ? (
            <span className="absolute top-0.5 right-0.5 block h-3 w-3 rounded-full ring-2 ring-primary bg-emerald-500" />
          ) : null}
        </button>
      </div>
    </div>
  );
};
