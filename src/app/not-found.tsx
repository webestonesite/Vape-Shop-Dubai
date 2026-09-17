import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fafafa]">
      
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Soft radial gradients for a cloud-like bright sky effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/40 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] bg-blue-50/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-gray-100 rounded-full blur-[100px]"></div>
        
        {/* Concrete floor simulation */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-200/50 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-white/40 backdrop-blur-sm border-t border-white"></div>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 inset-x-0 z-20 flex justify-between items-center p-6 lg:px-12">
        <Link href="/">
          <Image
            src="/Vape Shop Dubai logo 1.png"
            alt="Vape Shop Dubai"
            width={180}
            height={40}
            className="h-8 w-auto cursor-pointer relative z-10"
          />
        </Link>
        <Link href="/" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#f97316] transition-colors tracking-widest relative z-10">
          <ArrowLeft className="w-4 h-4" />
          BACK TO HOME
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center h-full mt-20 lg:mt-10">
        
        {/* Left Side: Character Image */}
        <div className="w-full lg:w-[45%] flex justify-center lg:justify-start items-end relative h-[350px] lg:h-[800px] mb-8 lg:mb-0 lg:pl-10 lg:-mt-24 xl:-mt-32">
          <div className="relative w-full h-full mx-auto lg:mx-0 lg:scale-[1.35] xl:scale-[1.65] lg:origin-bottom lg:-ml-5 xl:-ml-10">
            <Image
              src="/vape_404_character.png"
              alt="Sad Vape Character"
              fill
              className="object-contain object-bottom drop-shadow-2xl"
              priority
            />
          </div>
          {/* Absolute text on the left block (OOPS) - visible on large screens */}
          <div className="absolute bottom-16 lg:bottom-32 left-4 lg:left-0 z-20 hidden lg:flex flex-col transform -rotate-12 select-none opacity-20 lg:-ml-10 xl:-ml-20">
            <span className="font-bebas text-4xl xl:text-6xl text-[#111] leading-none tracking-wider">OOPS...</span>
            <span className="font-bebas text-4xl xl:text-6xl text-[#111] leading-none tracking-wider">THIS PAGE</span>
            <span className="font-bebas text-4xl xl:text-6xl text-[#111] leading-none tracking-wider">IS MISSING</span>
          </div>
        </div>

        {/* Right Side: Text & Actions */}
        <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-center text-center space-y-6 lg:pl-10">
          
          {/* Huge 404 Text */}
          <div className="font-bebas text-[9rem] sm:text-[12rem] xl:text-[15rem] leading-[0.8] text-[#1a1a1a] drop-shadow-xl flex items-center justify-center tracking-tighter">
            <span>4</span>
            <div className="relative mx-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ff8c3a] to-[#e0630b] drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] px-1 relative z-10">0</span>
              {/* Extra glow behind the zero */}
              <div className="absolute inset-0 bg-orange-500 blur-xl opacity-30 rounded-full z-0 transform scale-75"></div>
            </div>
            <span>4</span>
          </div>

          {/* Title */}
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a1a1a] tracking-tight">
            Page <span className="text-[#f97316]">Not Found</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto font-medium leading-relaxed px-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full pt-10 border-t border-gray-200/80 mt-8 px-4">
            {[
              { icon: Truck, title: "FREE DELIVERY", sub: "ON ORDERS 300AED+" },
              { icon: CreditCard, title: "SECURE PAYMENT", sub: "COD & CARD" },
              { icon: ShieldCheck, title: "100% ORIGINAL", sub: "AUTHENTIC PRODUCTS" },
              { icon: Headphones, title: "24/7 SUPPORT", sub: "WE'RE HERE TO HELP" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" strokeWidth={1.5} />
                <div>
                  <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-gray-800 leading-tight">{f.title}</div>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-gray-500 uppercase mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Footer Text */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center w-full px-4">
        <div className="flex items-center gap-3 sm:gap-6 text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase">
          <div className="w-8 sm:w-16 h-px bg-gray-300"></div>
          <span className="opacity-90">PREMIUM VAPES</span> 
          <span className="text-gray-400 font-normal">|</span> 
          <span className="opacity-90">BETTER DAYS AHEAD</span>
          <div className="w-8 sm:w-16 h-px bg-gray-300"></div>
        </div>
      </div>
      
    </div>
  );
}
