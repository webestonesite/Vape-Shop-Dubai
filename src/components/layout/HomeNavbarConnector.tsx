"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useHomeState } from "@/context/HomeStateContext";

export function HomeNavbarConnector() {
  const { activeCategory, setActiveCategory } = useHomeState();

  return (
    <Navbar 
      activeCategory={activeCategory} 
      onCategorySelect={setActiveCategory} 
    />
  );
}
