"use client";

import { useEffect, useState } from "react";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";

export function LazyWhatsApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <WhatsAppFloating />;
}
