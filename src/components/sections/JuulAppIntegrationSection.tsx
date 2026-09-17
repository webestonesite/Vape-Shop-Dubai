"use client";

import React, { useState } from "react";
import {
  Radio,
  BarChart3,
  Lock,
  BatteryCharging,
  Bell,
  ShieldCheck,
  Smartphone,
  Eye,
  MapPin,
  Menu,
  CheckCircle2,
  TrendingUp,
  Unlock,
  Battery,
  Zap,
  Activity,
  type LucideIcon,
} from "lucide-react";

interface JuulAppIntegrationSectionProps {
  className?: string;
}

export interface JuulAppFeature {
  /** Which phone screen this card shows. Also picks the card's icon. */
  screen: string;
  title: string;
  description: string;
}

export interface JuulAppIntegrationSettings {
  badgeText: string;
  heading: string;
  description: string;
  activeBadge: string;
  features: JuulAppFeature[];
}

/**
 * Icon per screen, rather than per card.
 *
 * The phone mockup on the left is a demo of six fixed screens; a card is the
 * label for one of them. Letting a "Battery Monitoring" card pick a bell icon
 * would only ever make the pairing wrong, so the screen carries the icon.
 */
const SCREEN_ICONS: Record<string, LucideIcon> = {
  bluetooth: Radio,
  analytics: BarChart3,
  lock: Lock,
  battery: BatteryCharging,
  notifications: Bell,
  age: ShieldCheck,
};

const FALLBACK_FEATURES: JuulAppFeature[] = [
  {
    screen: "bluetooth",
    title: "Instant Bluetooth Connect",
    description: "Pair with your JUUL 2 device in seconds. Auto-reconnects every time.",
  },
  {
    screen: "analytics",
    title: "Usage Analytics",
    description: "Track daily puff count, weekly trends, and nicotine intake in real-time.",
  },
  {
    screen: "lock",
    title: "Device Lock & Find",
    description: "Remotely lock your JUUL if lost and locate it via Bluetooth proximity scan.",
  },
  {
    screen: "battery",
    title: "Battery Monitoring",
    description: "Live battery status with low-battery push alerts before you run out.",
  },
  {
    screen: "notifications",
    title: "Smart Notifications",
    description: "Get notified for pod refilling, battery level alerts, and usage limits.",
  },
  {
    screen: "age",
    title: "Age Verification Lock",
    description: "Built-in smart age verification lock to prevent unauthorized access.",
  },
];

export function JuulAppIntegrationSection({
  className = "",
  settings,
}: JuulAppIntegrationSectionProps & { settings?: JuulAppIntegrationSettings }) {
  const features =
    settings?.features && settings.features.length > 0
      ? settings.features
      : FALLBACK_FEATURES;

  // Tracked by position, not by screen: two cards may demo the same screen.
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const analytics = features.findIndex((feat) => feat.screen === "analytics");
    return analytics === -1 ? 0 : analytics;
  });
  const activeFeature = features[activeIndex]?.screen ?? "analytics";

  /** The mockup's own shortcut buttons jump to whichever card owns a screen. */
  const setScreen = (screen: string) => {
    const index = features.findIndex((feat) => feat.screen === screen);
    if (index !== -1) setActiveIndex(index);
  };
  const [podHistoryRange, setPodHistoryRange] = useState<"7" | "30" | "90">("30");
  const [isDeviceLocked, setIsDeviceLocked] = useState<boolean>(true);


  return (
    <section className={`w-full ${className}`}>
      <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-md transition-all duration-300">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>{settings?.badgeText || "JUUL 2 Smart App Integration"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black text-foreground tracking-tight leading-tight">
            {settings?.heading || "Control Your JUUL 2 Directly From Your Phone"}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            {settings?.description ||
              "Discover the smart vaping era. Pair your JUUL 2 via Bluetooth to monitor your battery health, track puff counts, lock your device remotely, and secure age verification in one tap."}
          </p>
        </div>

        {/* Main Content Grid: Left Phone Mockup UI + Right 6 Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Interactive Phone Screen Mockup */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[370px] bg-slate-950 rounded-[3rem] border-[6px] border-slate-800 shadow-2xl p-3 pt-4 pb-4 overflow-hidden text-slate-100 font-sans transition-all duration-300">

              {/* iPhone Notch & Status Bar */}
              <div className="flex items-center justify-between px-6 pt-1 pb-2 text-[11px] font-semibold text-slate-300">
                <span>9:41</span>
                {/* Speaker notch pill */}
                <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto border border-slate-800/80" />
                <div className="flex items-center gap-1 text-[10px]">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <Battery className="w-3.5 h-3.5 text-slate-200" />
                </div>
              </div>

              {/* Warning Banner at top of phone screen */}
              <div className="bg-black text-slate-200 text-[8px] font-bold text-center uppercase tracking-wider py-1.5 px-3 border-y border-slate-800 leading-snug">
                WARNING: This product contains nicotine which is a highly addictive substance.
              </div>

              {/* Dynamic Phone Content Container */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 mt-3 min-h-[440px] flex flex-col justify-between relative overflow-hidden">

                {/* App Screen Content: Analytics */}
                {activeFeature === "analytics" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">PUFFS SO FAR</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">HIDE —</span>
                    </div>

                    <div>
                      <p className="text-sm font-serif font-bold text-slate-100">
                        So far, you have taken <span className="text-primary font-black text-lg">27 puffs</span>.
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200">TODAY: 27 PUFFS</span>
                        <span>AVG: 27 PUFFS</span>
                      </div>
                    </div>

                    {/* SVG Line Graph */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 relative">
                      <div className="text-[9px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                        <span>Puff Volume Curve</span>
                        <span className="text-emerald-400 font-bold">● Normal</span>
                      </div>

                      <svg className="w-full h-24 overflow-visible" viewBox="0 0 200 80">
                        <defs>
                          <linearGradient id="primaryArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E8521A" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#E8521A" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="200" y2="20" stroke="#334155" strokeDasharray="2,2" strokeWidth="0.5" />
                        <line x1="0" y1="50" x2="200" y2="50" stroke="#334155" strokeDasharray="2,2" strokeWidth="0.5" />

                        {/* Area under curve */}
                        <path
                          d="M 0,70 Q 50,65 100,45 T 160,20 T 200,60 L 200,75 L 0,75 Z"
                          fill="url(#primaryArea)"
                        />

                        {/* Smooth Curve */}
                        <path
                          d="M 0,70 Q 50,65 100,45 T 160,20 T 200,60"
                          fill="none"
                          stroke="#E8521A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Data Points */}
                        <circle cx="100" cy="45" r="3" fill="#E8521A" />
                        <circle cx="160" cy="20" r="4.5" fill="#FFFFFF" stroke="#E8521A" strokeWidth="2" />
                      </svg>

                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                        <span>6AM</span>
                        <span>12PM</span>
                        <span>6PM</span>
                        <span>12AM</span>
                      </div>
                    </div>

                    {/* Pod History Section */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">POD HISTORY</span>
                        <span className="text-[9px] font-bold text-slate-400">HIDE —</span>
                      </div>

                      {/* Days Filter Pills */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg text-[9px] text-center font-bold">
                        <button
                          onClick={() => setPodHistoryRange("7")}
                          className={`py-1 rounded transition-colors ${podHistoryRange === "7" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          7 DAYS
                        </button>
                        <button
                          onClick={() => setPodHistoryRange("30")}
                          className={`py-1 rounded transition-colors ${podHistoryRange === "30" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          30 DAYS
                        </button>
                        <button
                          onClick={() => setPodHistoryRange("90")}
                          className={`py-1 rounded transition-colors ${podHistoryRange === "90" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          90 DAYS
                        </button>
                      </div>

                      {/* Gauge Chart Graphic */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center relative">
                        <svg className="w-36 h-20" viewBox="0 0 100 55">
                          {/* Arc Background */}
                          <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#334155"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          {/* Arc Active Gradient Fill */}
                          <path
                            d="M 10 50 A 40 40 0 0 1 72 20"
                            fill="none"
                            stroke="#E8521A"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="text-center -mt-8">
                          <span className="text-xs font-black text-slate-100 font-mono">
                            {podHistoryRange === "7" ? "4.2 Pods" : podHistoryRange === "30" ? "14 Pods" : "42 Pods"}
                          </span>
                          <p className="text-[8px] text-slate-400 uppercase tracking-wider">Nicotine Salt Intake</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* App Screen Content: Bluetooth */}
                {activeFeature === "bluetooth" && (
                  <div className="space-y-6 text-center py-6 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 text-primary flex items-center justify-center mx-auto animate-pulse">
                      <Radio className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-base text-slate-100">JUUL 2 Connected</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Bluetooth 5.0 Low Energy Active</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left space-y-2 text-[10px]">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Device ID:</span>
                        <span className="font-mono text-slate-200">JL2-9984-UAE</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Signal Strength:</span>
                        <span className="text-emerald-400 font-bold">Strong (-42 dBm)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Auto Reconnect:</span>
                        <span className="text-primary font-bold">Enabled</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* App Screen Content: Lock & Find */}
                {activeFeature === "lock" && (
                  <div className="space-y-5 text-center py-4 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-primary text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                      {isDeviceLocked ? <Lock className="w-7 h-7" /> : <Unlock className="w-7 h-7 text-emerald-400" />}
                    </div>

                    <div>
                      <h4 className="font-serif font-black text-base text-slate-100">
                        {isDeviceLocked ? "JUUL 2 Device Locked" : "JUUL 2 Device Unlocked"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isDeviceLocked ? "Prevent unauthorized usage remotely" : "Ready to vape"}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsDeviceLocked(!isDeviceLocked)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${isDeviceLocked ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-emerald-600 text-white"
                        }`}
                    >
                      {isDeviceLocked ? "Tap to Unlock Device" : "Tap to Lock Device"}
                    </button>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-left">
                      <div className="flex items-center gap-2 text-primary font-bold mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Proximity Scan Active</span>
                      </div>
                      <p className="text-slate-400 text-[9.5px]">
                        Device located within 1.5m radius in Dubai, UAE.
                      </p>
                    </div>
                  </div>
                )}

                {/* App Screen Content: Battery */}
                {activeFeature === "battery" && (
                  <div className="space-y-6 text-center py-6 animate-in fade-in duration-300">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-primary"
                          strokeDasharray="84, 100"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-black font-mono text-slate-100">84%</span>
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest">Battery</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-100">Estimated ~240 Puffs Remaining</h4>
                      <p className="text-[11px] text-slate-400 mt-1">JUUL 2 USB Magnetic Fast Dock Supported</p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-2">
                      <BatteryCharging className="w-4 h-4 animate-pulse" />
                      <span>Low Battery Smart Push Notification Ready</span>
                    </div>
                  </div>
                )}

                {/* App Screen Content: Notifications */}
                {activeFeature === "notifications" && (
                  <div className="space-y-3 py-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">SMART ALERTS</span>
                      <Bell className="w-3.5 h-3.5 text-primary" />
                    </div>

                    <div className="space-y-2">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">Daily Target Reached</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">27 puffs recorded today. Moderate intake active.</p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">Official Pod Authenticated</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">JUUL 2 Crisp Mint Pod 1.8% verified authentic.</p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">Battery Level Alert</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Battery at 84%. Dock charging ready.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* App Screen Content: Age Lock */}
                {activeFeature === "age" && (
                  <div className="space-y-5 text-center py-6 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-8 h-8" />
                    </div>

                    <div>
                      <h4 className="font-serif font-black text-base text-slate-100">Age Verified (21+ UAE)</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Smart biometric lock prevents underage access</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-left space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>UAE Emirates ID Verification Passed</span>
                      </div>
                      <p className="text-slate-400 text-[9px]">
                        Device lock activates automatically when phone disconnects.
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone Bottom Tab Navigation Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-slate-500 px-2">
                  <button
                    onClick={() => setScreen("analytics")}
                    className={`p-1.5 rounded-lg transition-colors ${activeFeature === "analytics" ? "text-primary bg-primary/10" : "hover:text-slate-300"}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setScreen("analytics")}
                    className={`p-1.5 rounded-lg transition-colors ${activeFeature === "analytics" ? "text-primary bg-primary/10" : "hover:text-slate-300"}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setScreen("lock")}
                    className={`p-1.5 rounded-lg transition-colors ${activeFeature === "lock" ? "text-primary bg-primary/10" : "hover:text-slate-300"}`}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setScreen("bluetooth")}
                    className={`p-1.5 rounded-lg transition-colors ${activeFeature === "bluetooth" ? "text-primary bg-primary/10" : "hover:text-slate-300"}`}
                  >
                    <Radio className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setScreen("age")}
                    className={`p-1.5 rounded-lg transition-colors ${activeFeature === "age" ? "text-primary bg-primary/10" : "hover:text-slate-300"}`}
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: 6 Interactive Feature Cards (2 Cols x 3 Rows on md+) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, index) => {
              const Icon = SCREEN_ICONS[feat.screen] ?? BarChart3;
              const isActive = activeIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`text-left rounded-3xl p-6 transition-all duration-300 border cursor-pointer relative group flex flex-col justify-between ${isActive
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                      : "bg-card border border-border/80 hover:border-primary/50 hover:bg-card hover:shadow-md"
                    }`}
                >
                  {/* Active Screen Badge Pill for Usage Analytics card or active card */}
                  {isActive && (
                    <div className="absolute top-4 right-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                      {settings?.activeBadge || "ACTIVE SCREEN"}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Icon Container */}
                    <div
                      className={`w-12 h-12 rounded-2xl border p-2.5 flex items-center justify-center transition-colors duration-300 ${isActive
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-white"
                        }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3
                        className={`text-base font-serif font-bold transition-colors ${isActive ? "text-primary font-black" : "text-foreground group-hover:text-primary"
                          }`}
                      >
                        {feat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1.5">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                </button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
