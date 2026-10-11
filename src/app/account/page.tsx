import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomerDashboardClient } from "./CustomerDashboardClient";

export const metadata: Metadata = {
  title: "My Account & Orders | Vape Shop Dubai",
  description: "Track your vape orders, download order invoices, and manage saved delivery addresses at Vape Shop Dubai.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerAccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 pb-12 overflow-x-hidden">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <CustomerDashboardClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
