"use client";

import React, { createContext, useContext } from "react";

const PageTemplatesContext = createContext<Record<string, any> | null>(null);

export function usePageTemplates(): Record<string, any> | null {
  return useContext(PageTemplatesContext);
}

export function PageTemplatesProvider({
  templates,
  children,
}: {
  templates?: Record<string, any>;
  children: React.ReactNode;
}) {
  return (
    <PageTemplatesContext.Provider value={templates ?? null}>
      {children}
    </PageTemplatesContext.Provider>
  );
}

export default PageTemplatesProvider;
