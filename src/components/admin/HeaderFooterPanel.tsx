"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  Flame,
  Zap,
  Award,
  Droplet,
  ShieldCheck,
  Box,
  Tag,
  Settings,
  Menu as MenuIcon,
  Layers,
  Check,
  ExternalLink,
} from "lucide-react";

import { FOOTER_FIELDS, HEADER_FIELDS } from "@/lib/theme/sections";
import { DEFAULT_MEGA_MENU } from "@/lib/theme/defaults";
import type {
  ThemeSettings,
  MegaMenuSettings,
  MegaMenuCategory,
  MegaMenuBrandItem,
} from "@/lib/theme/types";

import { FieldRenderer } from "./FieldRenderer";

const AVAILABLE_ICONS = [
  { value: "Flame", label: "Flame (Disposables)" },
  { value: "Zap", label: "Lightning (Pod Systems)" },
  { value: "Award", label: "Award (E-Liquids & Salts)" },
  { value: "Droplet", label: "Droplet (Juice)" },
  { value: "ShieldCheck", label: "Shield (Authentic)" },
  { value: "Box", label: "Box (Devices)" },
  { value: "Tag", label: "Tag (Special Offers)" },
];

export const HeaderFooterPanel: React.FC<{
  which: "header" | "footer";
  settings: ThemeSettings;
  onBack: () => void;
  onChange: (next: ThemeSettings) => void;
}> = ({ which, settings, onBack, onChange }) => {
  const [headerTab, setHeaderTab] = useState<"general" | "menu" | "megamenu">("megamenu");

  // Ensure megaMenu is properly initialized with defaults if not present
  const megaMenu: MegaMenuSettings = settings.header.megaMenu ?? DEFAULT_MEGA_MENU;
  const [selectedCatId, setSelectedCatId] = useState<string>(
    megaMenu.categories[0]?.id ?? "disposable"
  );

  const fields = which === "header" ? HEADER_FIELDS : FOOTER_FIELDS;
  const values = settings[which] as unknown as Record<string, unknown>;

  const updateField = (key: string, value: unknown) => {
    onChange({
      ...settings,
      [which]: { ...(settings[which] as object), [key]: value },
    });
  };

  const updateMegaMenu = (updated: MegaMenuSettings) => {
    onChange({
      ...settings,
      header: {
        ...settings.header,
        megaMenu: updated,
      },
    });
  };

  const activeCategory =
    megaMenu.categories.find((c) => c.id === selectedCatId) ?? megaMenu.categories[0];

  const updateActiveCategory = (updater: (cat: MegaMenuCategory) => MegaMenuCategory) => {
    if (!activeCategory) return;
    const updatedCategories = megaMenu.categories.map((c) =>
      c.id === activeCategory.id ? updater(c) : c
    );
    updateMegaMenu({ ...megaMenu, categories: updatedCategories });
  };

  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCat: MegaMenuCategory = {
      id: newId,
      title: "New Category",
      subtitle: "Category description",
      badge: "NEW",
      icon: "Flame",
      viewAllHref: "/shop",
      viewAllLabel: "View All",
      featuredTitle: "Featured Showcase",
      featuredDescription: "Discover authentic products with fast delivery.",
      featuredTag: "Authentic",
      brands: [
        {
          name: "Sample Brand",
          href: "/shop",
          subtitle: "Popular Series",
          badge: "HOT",
          isHot: true,
        },
      ],
    };
    updateMegaMenu({
      ...megaMenu,
      categories: [...megaMenu.categories, newCat],
    });
    setSelectedCatId(newId);
  };

  const handleDeleteCategory = (catId: string) => {
    if (megaMenu.categories.length <= 1) {
      alert("At least one category is required.");
      return;
    }
    const filtered = megaMenu.categories.filter((c) => c.id !== catId);
    updateMegaMenu({ ...megaMenu, categories: filtered });
    if (selectedCatId === catId && filtered[0]) {
      setSelectedCatId(filtered[0].id);
    }
  };

  const handleAddBrand = () => {
    if (!activeCategory) return;
    const newBrand: MegaMenuBrandItem = {
      name: "New Brand",
      href: "/collections/all",
      subtitle: "Model or puff count",
      badge: "NEW",
      isHot: false,
    };
    updateActiveCategory((cat) => ({
      ...cat,
      brands: [...cat.brands, newBrand],
    }));
  };

  const handleUpdateBrand = (index: number, field: keyof MegaMenuBrandItem, val: unknown) => {
    if (!activeCategory) return;
    const updatedBrands = activeCategory.brands.map((b, i) =>
      i === index ? { ...b, [field]: val } : b
    );
    updateActiveCategory((cat) => ({
      ...cat,
      brands: updatedBrands,
    }));
  };

  const handleDeleteBrand = (index: number) => {
    if (!activeCategory) return;
    const updatedBrands = activeCategory.brands.filter((_, i) => i !== index);
    updateActiveCategory((cat) => ({
      ...cat,
      brands: updatedBrands,
    }));
  };

  return (
    <>
      {/* Header bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-2.5 bg-white">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Back to sections"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-[13px] font-black capitalize text-slate-800">
          {which} Customizer
        </h2>
      </div>

      {/* Header sub-tabs navigation */}
      {which === "header" && (
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-1 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setHeaderTab("megamenu")}
            className={`cursor-pointer px-3 py-1.5 text-[11px] font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              headerTab === "megamenu"
                ? "bg-white text-orange-600 border-t border-x border-slate-200 shadow-2xs font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            Mega Menu
          </button>
          <button
            type="button"
            onClick={() => setHeaderTab("general")}
            className={`cursor-pointer px-3 py-1.5 text-[11px] font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              headerTab === "general"
                ? "bg-white text-orange-600 border-t border-x border-slate-200 shadow-2xs font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            General & Logo
          </button>
          <button
            type="button"
            onClick={() => setHeaderTab("menu")}
            className={`cursor-pointer px-3 py-1.5 text-[11px] font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${
              headerTab === "menu"
                ? "bg-white text-orange-600 border-t border-x border-slate-200 shadow-2xs font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MenuIcon className="w-3.5 h-3.5" />
            Nav Links
          </button>
        </div>
      )}

      {/* Body content */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3.5 py-4">
        {which === "footer" ? (
          <>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Footer rendered across every page of the storefront.
            </p>
            {fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                values={values}
                onChange={updateField}
              />
            ))}
          </>
        ) : headerTab === "general" ? (
          <>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Configure announcement bar, storefront logo, and header text.
            </p>
            {fields
              .filter((f) => f.key !== "menu")
              .map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  values={values}
                  onChange={updateField}
                />
              ))}
          </>
        ) : headerTab === "menu" ? (
          <>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Manage top-level navbar links and standard sub-menus.
            </p>
            {fields
              .filter((f) => f.key === "menu")
              .map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  values={values}
                  onChange={updateField}
                />
              ))}
          </>
        ) : (
          /* MEGA MENU BUILDER */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/70 border border-orange-200/80">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Interactive Mega Menu
                </h3>
                <p className="text-[11px] text-slate-500">
                  Side-by-side brand showcase with hover category switcher.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={megaMenu.enabled}
                  onChange={(e) =>
                    updateMegaMenu({ ...megaMenu, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Navbar Trigger Label
              </label>
              <input
                type="text"
                value={megaMenu.triggerLabel ?? "BRAND"}
                onChange={(e) =>
                  updateMegaMenu({ ...megaMenu, triggerLabel: e.target.value })
                }
                placeholder="BRAND"
                className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-orange-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Hovering this navbar item in the header opens this mega menu.
              </p>
            </div>

            {/* Category tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Mega Menu Categories
                </label>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {megaMenu.categories.map((cat) => {
                  const isSel = cat.id === activeCategory?.id;
                  return (
                    <div
                      key={cat.id}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                        isSel
                          ? "bg-orange-50/60 border-orange-300 shadow-2xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedCatId(cat.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 text-xs font-black flex items-center justify-center shrink-0">
                          {cat.brands?.length ?? 0}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {cat.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {cat.badge || cat.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isSel && (
                          <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100">
                            Editing
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.id);
                          }}
                          className="p-1 text-slate-300 hover:text-red-500 rounded cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editing active category */}
            {activeCategory && (
              <div className="border border-slate-200 rounded-2xl bg-white p-3.5 space-y-3.5 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Edit Category: {activeCategory.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Brands under this category will show side-by-side when hovered.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Category Title
                    </label>
                    <input
                      type="text"
                      value={activeCategory.title}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({ ...c, title: e.target.value }))
                      }
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Badge Pill (e.g. 15K+ Puffs)
                    </label>
                    <input
                      type="text"
                      value={activeCategory.badge ?? ""}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({ ...c, badge: e.target.value }))
                      }
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={activeCategory.subtitle}
                    onChange={(e) =>
                      updateActiveCategory((c) => ({ ...c, subtitle: e.target.value }))
                    }
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Icon
                    </label>
                    <select
                      value={activeCategory.icon ?? "Flame"}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({ ...c, icon: e.target.value }))
                      }
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 cursor-pointer"
                    >
                      {AVAILABLE_ICONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      View All Link
                    </label>
                    <input
                      type="text"
                      value={activeCategory.viewAllHref ?? "/shop"}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({ ...c, viewAllHref: e.target.value }))
                      }
                      placeholder="/collections/..."
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Featured promo spotlight */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Side Featured Promo Box
                  </p>
                  <div>
                    <input
                      type="text"
                      value={activeCategory.featuredTitle ?? ""}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({ ...c, featuredTitle: e.target.value }))
                      }
                      placeholder="Featured headline..."
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={activeCategory.featuredDescription ?? ""}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({
                          ...c,
                          featuredDescription: e.target.value,
                        }))
                      }
                      placeholder="Promo copy / offer description..."
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={activeCategory.featuredTag ?? ""}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({ ...c, featuredTag: e.target.value }))
                      }
                      placeholder="Tag (e.g. ⚡ 3-Hour Delivery)"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={activeCategory.viewAllLabel ?? "View All"}
                      onChange={(e) =>
                        updateActiveCategory((c) => ({ ...c, viewAllLabel: e.target.value }))
                      }
                      placeholder="Button label (e.g. View All)"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Brands list */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Brands in this Category ({activeCategory.brands.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddBrand}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Brand
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {activeCategory.brands.map((brand, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={brand.name}
                            onChange={(e) =>
                              handleUpdateBrand(bIdx, "name", e.target.value)
                            }
                            placeholder="Brand name"
                            className="flex-1 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-1"
                          />
                          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(brand.isHot)}
                              onChange={(e) =>
                                handleUpdateBrand(bIdx, "isHot", e.target.checked)
                              }
                              className="rounded text-orange-600 cursor-pointer"
                            />
                            Hot
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDeleteBrand(bIdx)}
                            className="p-1 text-slate-300 hover:text-red-500 rounded cursor-pointer"
                            title="Remove brand"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={brand.href}
                            onChange={(e) =>
                              handleUpdateBrand(bIdx, "href", e.target.value)
                            }
                            placeholder="/collections/..."
                            className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1"
                          />
                          <input
                            type="text"
                            value={brand.badge ?? ""}
                            onChange={(e) =>
                              handleUpdateBrand(bIdx, "badge", e.target.value)
                            }
                            placeholder="Badge (e.g. 15K PUFFS)"
                            className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={brand.subtitle ?? ""}
                            onChange={(e) =>
                              handleUpdateBrand(bIdx, "subtitle", e.target.value)
                            }
                            placeholder="Subtitle (e.g. Crown Bar 8K)"
                            className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-1"
                          />
                          <input
                            type="text"
                            value={brand.logo ?? brand.icon ?? ""}
                            onChange={(e) =>
                              handleUpdateBrand(bIdx, "logo", e.target.value)
                            }
                            placeholder="Favicon/Logo (/brands/x.png)"
                            className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBrand}
                    className="w-full py-2 text-xs font-bold text-orange-600 border border-dashed border-orange-300 rounded-xl hover:bg-orange-50/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Brand
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
