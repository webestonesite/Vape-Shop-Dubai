import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white">
      
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/vape_404_bg.png"
          alt="404 Background"
          fill
          className="object-cover object-left lg:object-center opacity-90"
          priority
        />
        {/* Gradient overlay to make text readable on the right side */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-white/95 lg:w-[65%] lg:left-auto lg:right-0"></div>
        
        {/* Bottom gradient for smooth fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 inset-x-0 z-20 flex justify-between items-center p-6 lg:px-12">
        <Link href="/">
          <Image
            src="/Vape Shop Dubai logo 1.png"
            alt="Vape Shop Dubai"
            width={180}
            height={40}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>
        <Link href="/" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 hover:text-[#f97316] transition-colors tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          BACK TO HOME
        </Link>
      </div>

      {/* Content Container (Right aligned on desktop) */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 flex justify-end h-full mt-10">
        <div className="w-full lg:w-[60%] xl:w-[50%] flex flex-col items-center text-center space-y-6">
          
          {/* Huge 404 Text */}
          <div className="font-bebas text-[10rem] md:text-[14rem] leading-none text-[#232323] drop-shadow-2xl flex items-center justify-center tracking-tighter">
            <span>4</span>
            <div className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ff8c3a] to-[#e0630b] drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] px-1 relative z-10">0</span>
              {/* Extra glow behind the zero */}
              <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-40 rounded-full z-0 transform scale-75"></div>
            </div>
            <span>4</span>
          </div>

          {/* Title */}
          <h1 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#232323] tracking-tight">
            Page <span className="text-[#f97316]">Not Found</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto font-medium leading-relaxed px-4">
            Looks like this page has gone for a vape break. <br className="hidden sm:block" />
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full max-w-sm mx-auto sm:max-w-none px-4">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff8c3a] to-[#f97316] hover:from-[#f97316] hover:to-[#e0630b] text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link 
              href="/shop"
              className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-800 px-8 py-3.5 rounded-full text-sm font-bold shadow-xs hover:border-gray-300 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <ShoppingBag className="w-4 h-4" /> Shop Now
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full pt-10 border-t border-gray-200/60 mt-10 px-4">
            {[
              { icon: Truck, title: "FREE DELIVERY", sub: "ON ORDERS 300AED+" },
              { icon: CreditCard, title: "SECURE PAYMENT", sub: "COD & CARD" },
              { icon: ShieldCheck, title: "100% ORIGINAL", sub: "AUTHENTIC PRODUCTS" },
              { icon: Headphones, title: "24/7 SUPPORT", sub: "WE'RE HERE TO HELP" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <f.icon className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                <div>
                  <div className="text-[10px] font-black tracking-widest text-gray-900 leading-tight">{f.title}</div>
                  <div className="text-[9px] font-semibold text-gray-500 uppercase mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer Text */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center w-full px-4">
        <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-bold tracking-widest text-gray-800 uppercase">
          <div className="w-8 sm:w-16 h-px bg-gray-300"></div>
          <span className="opacity-90">PREMIUM VAPES</span> 
          <span className="text-gray-400 font-normal">|</span> 
          <span className="opacity-90">BETTER DAYS AHEAD</span>
          <div className="w-8 sm:w-16 h-px bg-gray-300"></div>
        </div>
      </div>
      
      {/* Absolute text on the left block (OOPS) - visible on large screens */}
      <div className="absolute bottom-40 left-16 z-20 hidden xl:flex flex-col transform -rotate-12 select-none opacity-40">
        <span className="font-bebas text-5xl text-[#232323] leading-none tracking-wider mix-blend-multiply">OOPS...</span>
        <span className="font-bebas text-5xl text-[#232323] leading-none tracking-wider mix-blend-multiply">THIS PAGE</span>
        <span className="font-bebas text-5xl text-[#232323] leading-none tracking-wider mix-blend-multiply">IS MISSING</span>
      </div>
    </div>
  );
}
