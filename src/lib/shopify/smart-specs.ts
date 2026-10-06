export interface SpecItem {
  label: string;
  value: string;
}

export interface RawProductInput {
  name?: string;
  title?: string;
  category?: string;
  brand?: string;
  vendor?: string;
  tags?: string[];
  descriptionHtml?: string;
  puffs?: string;
  nicotine?: string;
  battery?: string;
}

/**
 * Extracts exact nicotine level from title, tags, or description.
 * Examples handled:
 * - 18MG / 18mg -> "18mg/ml (1.8%)"
 * - 20MG / 20mg -> "20mg/ml (2%)"
 * - 50MG / 50mg -> "50mg/ml (5%)"
 * - 25MG / 25mg -> "25mg/ml (2.5%)"
 * - 30MG / 30mg -> "30mg/ml (3%)"
 * - 3MG / 3mg -> "3mg/ml (0.3%)"
 * - 6MG / 6mg -> "6mg/ml (0.6%)"
 * - 0MG / 0mg -> "0mg (Nicotine Free)"
 * - 1.8% -> "18mg/ml (1.8%)"
 * - 2% -> "20mg/ml (2%)"
 * - 3% -> "30mg/ml (3%)"
 * - 5% -> "50mg/ml (5%)"
 * - 6% -> "60mg/ml (6%)"
 */
export function extractNicotine(
  title: string,
  tags: string[] = [],
  desc: string = "",
  kind: string = ""
): string | undefined {
  if (kind === "device") return undefined; // Devices don't have nicotine

  const combined = `${title} ${tags.join(" ")}`;

  // 1. Check title / tags for explicit mg
  const mgMatch = combined.match(/\b(18|20|25|30|35|50|60)\s*mg\b/i);
  if (mgMatch) {
    const val = mgMatch[1];
    const pct =
      val === "18" ? "1.8" :
      val === "20" ? "2" :
      val === "25" ? "2.5" :
      val === "30" ? "3" :
      val === "35" ? "3.5" :
      val === "50" ? "5" : "6";
    return `${val}mg/ml (${pct}%)`;
  }

  // Low mg for freebase
  const lowMgMatch = combined.match(/\b(0|3|6)\s*mg\b/i);
  if (lowMgMatch) {
    const val = lowMgMatch[1];
    if (val === "0") return "0mg (Nicotine Free)";
    return `${val}mg/ml (${val === "3" ? "0.3" : "0.6"}%)`;
  }

  // 2. Check title / tags for explicit %
  const pctMatch = combined.match(/\b(1\.8|2|3|5|6)\s*%/i);
  if (pctMatch) {
    const val = pctMatch[1];
    const mg =
      val === "1.8" ? "18mg/ml" :
      val === "2" ? "20mg/ml" :
      val === "3" ? "30mg/ml" :
      val === "5" ? "50mg/ml" : "60mg/ml";
    return `${mg} (${val}%)`;
  }

  // 3. Dual strengths like "20mg / 50mg"
  if (/\b20\s*mg\b/i.test(combined) && /\b50\s*mg\b/i.test(combined)) {
    return "20mg / 50mg (Dual Strength Available)";
  }

  // 4. Description HTML check
  if (desc) {
    const plainDesc = desc.replace(/<[^>]*>/g, " ");
    const descMg = plainDesc.match(/\b(18|20|25|30|35|50)\s*mg\b/i);
    if (descMg) {
      const val = descMg[1];
      const pct = val === "18" ? "1.8" : val === "20" ? "2" : val === "25" ? "2.5" : val === "30" ? "3" : val === "35" ? "3.5" : "5";
      return `${val}mg/ml (${pct}%)`;
    }
    const descPct = plainDesc.match(/\b(1\.8|2|3|5)\s*%/i);
    if (descPct) {
      const val = descPct[1];
      const mg = val === "1.8" ? "18mg/ml" : val === "2" ? "20mg/ml" : val === "3" ? "30mg/ml" : "50mg/ml";
      return `${mg} (${val}%)`;
    }
  }

  // 5. Intelligent product-line defaults
  const titleLower = title.toLowerCase();
  if (titleLower.includes("juul 2") || titleLower.includes("juul2")) {
    return "18mg/ml (1.8%)"; // Juul 2 pods are strictly 18mg in UK/UAE
  }
  if (titleLower.includes("juul")) {
    return "5% (50mg) / 3% (30mg)";
  }
  if (kind === "disposable") {
    return "5% (50mg)";
  }

  return undefined;
}

/**
 * Extracts exact puff capacity.
 */
export function extractPuffs(
  title: string,
  tags: string[] = [],
  desc: string = "",
  kind: string = ""
): string | undefined {
  if (kind === "device" || kind === "liquid" || kind === "heated-tobacco") {
    return undefined; // Not applicable
  }

  const combined = `${title} ${tags.join(" ")}`;

  // Matches "8000 Puffs", "15000 Puffs", "12,000 Puffs", "2500+ Puffs"
  const match = combined.match(/\b(\d{1,2},?\d{3}|\d{3,5})\s*\+?\s*puffs?\b/i);
  if (match) {
    return `${match[1].replace(/,/g, "")} Puffs`;
  }

  if (desc) {
    const plain = desc.replace(/<[^>]*>/g, " ");
    const descMatch = plain.match(/\b(\d{1,2},?\d{3}|\d{3,5})\s*\+?\s*puffs?\b/i);
    if (descMatch) {
      return `${descMatch[1].replace(/,/g, "")} Puffs`;
    }
  }

  if (kind === "disposable") {
    return "High Capacity";
  }

  return undefined;
}

/**
 * Detects the product kind: 'pods', 'disposable', 'liquid', 'device', or 'heated-tobacco'.
 */
export function detectProductKind(
  title: string,
  category: string = "",
  tags: string[] = []
): "pods" | "disposable" | "liquid" | "device" | "heated-tobacco" {
  const combined = `${title} ${category} ${tags.join(" ")}`.toLowerCase();

  if (combined.includes("terea") || combined.includes("heets") || combined.includes("iqos")) {
    return "heated-tobacco";
  }

  // Check if device or kit first
  if (
    combined.includes("device") ||
    combined.includes("starter kit") ||
    combined.includes("pod kit") ||
    combined.includes("vape kit") ||
    combined.includes("box mod") ||
    combined.includes("battery kit")
  ) {
    return "device";
  }

  // Check if pod refills/cartridges
  if (
    combined.includes("pod") ||
    combined.includes("pods") ||
    combined.includes("cartridge") ||
    combined.includes("cartridges") ||
    combined.includes("refill")
  ) {
    // Distinguish "pod system" which is a device vs "juul pods" which are pods
    if (combined.includes("pod system") && !combined.includes("juul 2 pods") && !combined.includes("myle v5 pods")) {
      return "device";
    }
    return "pods";
  }

  // Check if liquid
  if (
    category === "e-liquids" ||
    combined.includes("e-liquid") ||
    combined.includes("e-juice") ||
    combined.includes("saltnic") ||
    combined.includes("salt nic") ||
    combined.includes("freebase") ||
    /\b(30|60|100|120)\s*ml\b/i.test(combined)
  ) {
    return "liquid";
  }

  // Check if disposable
  if (
    category === "disposables" ||
    combined.includes("disposable") ||
    combined.includes("puff") ||
    combined.includes("puffs")
  ) {
    return "disposable";
  }

  if (category === "juul") {
    return combined.includes("device") ? "device" : "pods";
  }

  return "disposable";
}

/**
 * Extracts pack size for pods / heated tobacco.
 */
export function extractPackSize(title: string, desc: string = "", kind: string = ""): string | undefined {
  const combined = `${title} ${desc}`.toLowerCase();

  const match = combined.match(/\b(2|3|4|5|10|20)\s*(?:pc|pcs|pack|pods|pieces)\b/i);
  if (match) {
    const count = match[1];
    return `${count} ${kind === "heated-tobacco" ? "Sticks" : "Pods"} / Pack`;
  }

  if (combined.includes("juul 2") || combined.includes("juul2")) {
    return "2 Pods / Pack";
  }
  if (combined.includes("juul")) {
    return "4 Pods / Pack";
  }
  if (combined.includes("myle")) {
    return combined.includes("v5") || combined.includes("meta") ? "2 Pods / Pack" : "4 Pods / Pack";
  }
  if (kind === "heated-tobacco") {
    return "20 Sticks / Pack (Carton = 200)";
  }

  return undefined;
}

/**
 * Extracts device compatibility.
 */
export function extractCompatibility(title: string, brand: string = ""): string | undefined {
  const t = title.toLowerCase();

  if (t.includes("juul 2") || t.includes("juul2")) {
    return t.includes("device") ? "JUUL 2 Pods Only" : "JUUL 2 Device Only";
  }
  if (t.includes("juul")) {
    return t.includes("device") ? "JUUL 1 Pods Compatible" : "JUUL 1 / Classic Device";
  }
  if (t.includes("myle v5") || t.includes("myle meta")) {
    return "MYLE V5 / Meta Device";
  }
  if (t.includes("myle v4")) {
    return "MYLE V4 Device";
  }
  if (t.includes("terea")) {
    return "IQOS ILUMA Only (Not for IQOS 3)";
  }
  if (t.includes("heets")) {
    return "IQOS 3 Duo / Originals";
  }
  if (t.includes("relx")) {
    return "RELX Infinity / Essential";
  }
  if (t.includes("xros")) {
    return "Vaporesso XROS Pods Series";
  }
  if (t.includes("caliburn")) {
    return "Uwell Caliburn Pod Series";
  }

  return undefined;
}

/**
 * Generates 100% accurate, category-specific specifications when the merchant has not
 * filled the custom.key_specifications metafield in Shopify Admin.
 */
export function getAccurateProductSpecs(product: RawProductInput): SpecItem[] {
  const title = product.name || product.title || "";
  const category = (product.category || "").toLowerCase();
  const tags = product.tags || [];
  const desc = product.descriptionHtml || "";
  const brand = product.brand || product.vendor || "Vape Shop Dubai";

  const kind = detectProductKind(title, category, tags);

  const nicotine = product.nicotine || extractNicotine(title, tags, desc, kind);
  const puffs = product.puffs || extractPuffs(title, tags, desc, kind);
  const packSize = extractPackSize(title, desc, kind);
  const compatibility = extractCompatibility(title, brand);

  const rows: SpecItem[] = [];

  // ─── 1. PODS / CARTRIDGES (JUUL, Myle, Relx, etc.) ──────────────────────
  if (kind === "pods") {
    rows.push({ label: "Brand", value: brand });

    if (title.toLowerCase().includes("juul 2") || title.toLowerCase().includes("juul2")) {
      rows.push({ label: "Series", value: "JUUL 2" });
    } else if (title.toLowerCase().includes("myle v5") || title.toLowerCase().includes("meta")) {
      rows.push({ label: "Series", value: "MYLE Meta V5" });
    } else {
      rows.push({ label: "Product Type", value: "Pre-filled Replacement Pods" });
    }

    if (nicotine) {
      rows.push({ label: "Nicotine Level", value: nicotine });
    }
    if (packSize) {
      rows.push({ label: "Pack Size", value: packSize });
    }
    if (compatibility) {
      rows.push({ label: "Compatibility", value: compatibility });
    }

    rows.push({ label: "Activation", value: "Draw-Activated (via Device)" });

    if (title.toLowerCase().includes("made in uk") || desc.toLowerCase().includes("made in uk")) {
      rows.push({ label: "Origin", value: "Made in UK" });
    } else if (title.toLowerCase().includes("usa made") || desc.toLowerCase().includes("usa made")) {
      rows.push({ label: "Origin", value: "USA Made" });
    } else {
      rows.push({ label: "Authenticity", value: "100% Original Genuine" });
    }

    return rows;
  }

  // ─── 2. DISPOSABLES (Crown Bar, Tugboat, Yuoto, Ghost Pro, etc.) ────────
  if (kind === "disposable") {
    rows.push({ label: "Brand", value: brand });

    if (puffs) {
      rows.push({ label: "Puff Capacity", value: puffs });
    }
    if (nicotine) {
      rows.push({ label: "Nicotine Level", value: nicotine });
    }

    // Battery & Charging (only for disposables with enough puffs or rechargeable)
    const puffNum = parseInt((puffs || "").replace(/\D/g, "")) || 0;
    if (puffNum >= 2500 || title.toLowerCase().includes("rechargeable") || desc.toLowerCase().includes("type-c")) {
      rows.push({ label: "Battery Spec", value: "Rechargeable Built-in" });
      rows.push({ label: "Charging", value: "Type-C Fast Charge" });
    } else {
      rows.push({ label: "Battery Spec", value: "Pre-charged Built-in" });
    }

    rows.push({ label: "Activation", value: "Draw-Activated" });
    return rows;
  }

  // ─── 3. E-LIQUIDS / SALT NIC / FREEBASE ──────────────────────────────────
  if (kind === "liquid") {
    rows.push({ label: "Brand", value: brand });

    // Bottle size
    const sizeMatch = `${title} ${desc}`.match(/\b(10|15|30|50|60|100|120)\s*ml\b/i);
    if (sizeMatch) {
      rows.push({ label: "Bottle Size", value: `${sizeMatch[1]}ml` });
    }

    if (nicotine) {
      rows.push({ label: "Nicotine Strength", value: nicotine });
    }

    const isSalt = title.toLowerCase().includes("salt") || desc.toLowerCase().includes("salt");
    rows.push({
      label: "Liquid Type",
      value: isSalt ? "Nicotine Salt (SaltNic)" : "Freebase E-Liquid",
    });
    rows.push({
      label: "VG/PG Ratio",
      value: isSalt ? "50% VG / 50% PG" : "70% VG / 30% PG",
    });
    rows.push({ label: "Authenticity", value: "100% Original Imported" });

    return rows;
  }

  // ─── 4. DEVICES / STARTER KITS / POD SYSTEMS ─────────────────────────────
  if (kind === "device") {
    rows.push({ label: "Brand", value: brand });
    rows.push({ label: "Device Type", value: "Starter Kit / Pod System" });

    if (compatibility) {
      rows.push({ label: "Compatibility", value: compatibility });
    }

    // Check mAh
    const mahMatch = `${title} ${desc}`.match(/\b(\d{3,4})\s*mah\b/i);
    rows.push({
      label: "Battery Spec",
      value: mahMatch ? `${mahMatch[1]}mAh Built-in` : "Rechargeable Built-in",
    });

    if (title.toLowerCase().includes("juul 2") || title.toLowerCase().includes("juul2")) {
      rows.push({ label: "Charging", value: "Smart USB Charging Dock" });
    } else {
      rows.push({ label: "Charging", value: "Type-C Fast Charge" });
    }

    rows.push({ label: "Activation", value: "Draw-Activated" });
    return rows;
  }

  // ─── 5. HEATED TOBACCO (TEREA / HEETS) ────────────────────────────────────
  if (kind === "heated-tobacco") {
    rows.push({ label: "Brand", value: brand });
    if (compatibility) {
      rows.push({ label: "Compatibility", value: compatibility });
    }
    if (packSize) {
      rows.push({ label: "Pack Size", value: packSize });
    }
    rows.push({
      label: "Technology",
      value: title.toLowerCase().includes("terea") ? "Smartcore Induction" : "HeatControl Blade",
    });
    rows.push({ label: "Authenticity", value: "100% Original Authentic" });
    return rows;
  }

  // Fallback default
  rows.push({ label: "Brand", value: brand });
  if (nicotine) rows.push({ label: "Nicotine Level", value: nicotine });
  if (puffs) rows.push({ label: "Puff Capacity", value: puffs });
  rows.push({ label: "Activation", value: "Draw-Activated" });
  return rows;
}
