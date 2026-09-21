"use client";

import React, { createContext, useContext, useState } from "react";

interface HomeState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const HomeContext = createContext<HomeState>({
  searchQuery: "",
  setSearchQuery: () => {},
  activeCategory: "all",
  setActiveCategory: () => {},
});

export const HomeStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <HomeContext.Provider value={{ searchQuery, setSearchQuery, activeCategory, setActiveCategory }}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeState = () => useContext(HomeContext);
