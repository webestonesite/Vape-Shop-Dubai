"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  MapPin,
  Building,
  Home,
  Check,
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { isValidUAEPhone, formatUAEPhone, validateUAEPhone } from "@/lib/uae-phone";
import { auth } from "@/lib/firebase/client";

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const {
    user,
    addresses,
    loading: authLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    updateProfileDetails,
    saveAddress,
    resetPassword,
  } = useCustomerAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  // Multi-step signup:
  // Step 1: Initial View (Email, Password, Continue with Google) - matches screenshot
  // Step 2: 1st Step: Full Name
  // Step 3: 2nd Step: UAE Mobile Number (Strict UAE operator check)
  // Step 4: 3rd Step: UAE Delivery Address (Emirate, Area, Street, Apt)
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [area, setArea] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [villaOrApt, setVillaOrApt] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Google onboarding state
  const [isGoogleOnboarding, setIsGoogleOnboarding] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // If already logged in and not in the middle of signup wizard, redirect
  useEffect(() => {
    if (!authLoading && user && !isGoogleOnboarding && mode !== "signup") {
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl, isGoogleOnboarding, mode]);

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (mode === "signup") {
      setIsGoogleOnboarding(true);
    }

    const res = await signInWithGoogle();
    setLoading(false);

    if (res.success) {
      const gUser = auth.currentUser;
      const gName = gUser?.displayName || "";
      if (mode === "signup" || addresses.length === 0) {
        setIsGoogleOnboarding(true);
        if (gName && !name) {
          setName(gName);
        }
        // Advance directly to step 2 (or step 3 if name exists)
        setSignupStep(gName ? 3 : 2);
      } else {
        router.push(redirectUrl);
      }
    } else {
      setIsGoogleOnboarding(false);
      setError(res.error || "Google sign in failed");
    }
  };

  // Step 1: Validate Email & Password, advance to Step 2 (Name)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setSignupStep(2);
  };

  // Step 2: Validate Name, advance to Step 3 (Mobile)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSignupStep(3);
  };

  // Step 3: Validate UAE Mobile, advance to Step 4 (Address)
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phoneError = validateUAEPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setPhone(formatUAEPhone(phone));
    setSignupStep(4);
  };

  // Step 4: Final Submit (Address + Account Creation)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!area.trim()) {
      setError("Please enter your Area / Neighborhood (e.g. Downtown Dubai, Dubai Marina).");
      return;
    }

    if (!addressLine1.trim()) {
      setError("Please enter your Street / Building delivery address.");
      return;
    }

    setLoading(true);
    const formattedPhone = formatUAEPhone(phone);

    if (isGoogleOnboarding && user) {
      // User signed in via Google, now saving phone and delivery address
      try {
        await updateProfileDetails({
          name: name.trim(),
          phone: formattedPhone,
        });

        await saveAddress({
          fullName: name.trim(),
          phone: formattedPhone,
          emirate,
          city: emirate,
          area: area.trim(),
          addressLine1: addressLine1.trim(),
          villaOrApt: villaOrApt.trim(),
          isDefault: true,
        });

        setLoading(false);
        setSuccessMsg("UAE Delivery Address saved successfully! Redirecting...");
        setTimeout(() => {
          setIsGoogleOnboarding(false);
          router.push(redirectUrl);
        }, 1000);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || "Failed to save address details.");
      }
    } else {
      // Standard Email & Password registration with address
      const res = await signUpWithEmail(email, password, name.trim(), formattedPhone, {
        emirate,
        city: emirate,
        area: area.trim(),
        addressLine1: addressLine1.trim(),
        villaOrApt: villaOrApt.trim(),
      });
      setLoading(false);

      if (res.success) {
        setSuccessMsg("Account created with your UAE address! Redirecting...");
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1200);
      } else {
        setError(res.error || "Failed to create account.");
      }
    }
  };

  // Sign In submit handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotStatus(null);
    const res = await resetPassword(forgotEmail);
    setForgotLoading(false);
    if (res.success) {
      setForgotStatus({
        success: true,
        msg: "Password reset instructions have been sent to your email.",
      });
    } else {
      setForgotStatus({
        success: false,
        msg: res.error || "Failed to send reset link.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-md transition-all duration-300">
          
          {/* Clay Card Container */}
          <div className="clay-card p-6 sm:p-10 relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

            {/* Header: Dynamic per mode & step */}
            <div className="text-center mb-6">
              <span className="clay-badge inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/25 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Customer Portal</span>
              </span>

              {mode === "signin" || signupStep === 1 ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
                    {mode === "signin" ? "Welcome Back" : "Create Account"}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    {mode === "signin"
                      ? "Track your orders, re-order favorites & download order invoices"
                      : "Save delivery addresses and enjoy fast 3-hour Dubai express shipping"}
                  </p>
                </>
              ) : signupStep === 2 ? (
                <>
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-foreground tracking-tight">
                    What should we call you?
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    Step 1 of 3: Enter your full name for orders & delivery invoices
                  </p>
                </>
              ) : signupStep === 3 ? (
                <>
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-foreground tracking-tight">
                    UAE Mobile Number
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    Step 2 of 3: Driver delivery updates & WhatsApp order tracking
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-serif font-black text-foreground tracking-tight">
                    UAE Delivery Address
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    Step 3 of 3: Auto-fills at checkout for fast 1-click orders
                  </p>
                </>
              )}
            </div>

            {/* Mode Switcher Tabs (Only shown on initial screen) */}
            {signupStep === 1 && (
              <div className="clay-inset p-1.5 grid grid-cols-2 gap-1 mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                    mode === "signin"
                      ? "clay-pill-active font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                    mode === "signup"
                      ? "clay-pill-active font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Multi-step progress bar (shown during steps 2, 3, 4) */}
            {mode === "signup" && signupStep > 1 && (
              <div className="mb-6 p-3 rounded-2xl bg-muted/40 border border-border/50">
                <div className="flex items-center justify-between">
                  {/* Step 1 indicator: Name */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                        signupStep > 2
                          ? "bg-emerald-500 text-white"
                          : signupStep === 2
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {signupStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        signupStep === 2 ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Name
                    </span>
                  </div>

                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      signupStep >= 3 ? "bg-primary" : "bg-border/60"
                    }`}
                  />

                  {/* Step 2 indicator: Mobile */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                        signupStep > 3
                          ? "bg-emerald-500 text-white"
                          : signupStep === 3
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {signupStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        signupStep === 3 ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Mobile
                    </span>
                  </div>

                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      signupStep >= 4 ? "bg-primary" : "bg-border/60"
                    }`}
                  />

                  {/* Step 3 indicator: Address */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                        signupStep === 4
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      3
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        signupStep === 4 ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Address
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error / Success Alerts */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{successMsg}</span>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 1: Normal Initial View (Email + Password + Google)
                Exactly matches the user's screenshot
            ══════════════════════════════════════════════════════════════════ */}
            {signupStep === 1 && (
              <div className="animate-in fade-in duration-300">
                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="clay-pill w-full py-3.5 px-4 text-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer hover:text-primary transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <span className="relative bg-card px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Or with Email
                  </span>
                </div>

                {/* Form: Email & Password */}
                <form
                  onSubmit={mode === "signin" ? handleSignInSubmit : handleStep1Submit}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[11px] font-semibold text-foreground/85 block mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="clay-inset w-full pl-10 pr-4 py-3 text-xs font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-foreground/85">
                        Password *
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => setForgotModalOpen(true)}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="clay-inset w-full pl-10 pr-10 py-3 text-xs font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="clay-btn-primary w-full py-3.5 px-6 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {loading
                        ? "Please wait..."
                        : mode === "signin"
                        ? "Sign In to Account"
                        : "Next: Personal Details"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 2: Step 1 of 3: Full Name
            ══════════════════════════════════════════════════════════════════ */}
            {mode === "signup" && signupStep === 2 && (
              <form
                onSubmit={handleStep2Submit}
                className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div>
                  <label className="text-[11px] font-semibold text-foreground/85 block mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="clay-inset w-full pl-10 pr-4 py-3 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSignupStep(1);
                    }}
                    className="clay-pill px-4 py-3.5 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="clay-btn-primary flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Next: Mobile Number</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 3: Step 2 of 3: UAE Mobile Number
            ══════════════════════════════════════════════════════════════════ */}
            {mode === "signup" && signupStep === 3 && (
              <form
                onSubmit={handleStep3Submit}
                className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-foreground/85">
                      UAE Mobile Number *
                    </label>
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <span>🇦🇪</span>
                      <span>UAE Operators</span>
                    </span>
                  </div>

                  <div className="relative">
                    <Phone className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      autoFocus
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="050 123 4567"
                      className="clay-inset w-full pl-10 pr-4 py-3 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 outline-none font-mono"
                    />
                  </div>

                  {/* Real-time validation indicator */}
                  {phone.trim() ? (
                    isValidUAEPhone(phone) ? (
                      <span className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 mt-2 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Valid UAE Mobile ({formatUAEPhone(phone)})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-amber-500 font-medium mt-2 block bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        ⚠️ Must be a valid UAE number starting with 050, 052, 054, 055, 056, or 058.
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-muted-foreground mt-1.5 block">
                      Accepted: 050 123 4567 or +971 50 123 4567
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSignupStep(2);
                    }}
                    className="clay-pill px-4 py-3.5 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="clay-btn-primary flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Next: Delivery Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SCREEN 4: Step 3 of 3: UAE Delivery Address & Final Registration
            ══════════════════════════════════════════════════════════════════ */}
            {mode === "signup" && signupStep === 4 && (
              <form
                onSubmit={handleFinalSubmit}
                className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                {/* Emirate & Area in clean 2-column layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-foreground/85 block mb-1.5">
                      Emirate *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={emirate}
                        onChange={(e) => setEmirate(e.target.value)}
                        className="clay-inset w-full pl-9 pr-3 py-3 text-xs font-medium text-foreground outline-none bg-card cursor-pointer"
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
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-foreground/85 block mb-1.5">
                      Area / Neighborhood *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="Downtown, Marina, JBR..."
                        className="clay-inset w-full pl-9 pr-3 py-3 text-xs font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Street / Building Address */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground/85 block mb-1.5">
                    Street & Building Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Building name, street or landmark"
                      className="clay-inset w-full pl-9 pr-3 py-3 text-xs font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 outline-none"
                    />
                  </div>
                </div>

                {/* Villa / Apartment No. */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground/85 block mb-1.5">
                    Apartment / Villa <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={villaOrApt}
                      onChange={(e) => setVillaOrApt(e.target.value)}
                      placeholder="e.g. Apt 402, Villa 12B"
                      className="clay-inset w-full pl-9 pr-3 py-3 text-xs font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 outline-none"
                    />
                  </div>
                </div>

                {/* Auto-fill micro-hint */}
                <p className="text-center text-[11px] text-muted-foreground/80 flex items-center justify-center gap-1.5 pt-1">
                  <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Auto-fills at checkout for instant 1-click orders</span>
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSignupStep(3);
                    }}
                    className="clay-pill px-4 py-3.5 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="clay-btn-primary flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {loading
                        ? "Saving..."
                        : isGoogleOnboarding
                        ? "Save Address & Proceed"
                        : "Complete Registration 🎉"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Footer security note */}
            <div className="mt-8 pt-4 border-t border-border/50 text-center text-[10px] text-muted-foreground font-medium">
              🔒 256-Bit SSL Encrypted • 18+ Adult Verification Policy
            </div>

          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-serif font-black text-foreground">Reset Password</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your registered email address to receive password reset link.
            </p>

            {forgotStatus && (
              <div
                className={`my-3 p-3 rounded-2xl text-xs font-bold ${
                  forgotStatus.success
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                    : "bg-red-500/10 border border-red-500/20 text-red-500"
                }`}
              >
                {forgotStatus.msg}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                className="clay-inset w-full px-4 py-3 text-xs font-bold text-foreground placeholder:text-muted-foreground outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotStatus(null);
                  }}
                  className="clay-pill flex-1 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="clay-btn-primary flex-1 py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
