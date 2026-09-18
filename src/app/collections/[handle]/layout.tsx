import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const CANONICAL_COLLECTION_TITLES: Record<string, string> = {
  "accessories": "Vape Accessories & Coils in UAE | Vape Shop Dubai",
  "disposable-vape": "Buy Best Disposable Vapes in UAE | Same-Day Dubai Delivery",
  "disposables": "Disposable Vapes in Dubai, UAE | Vape Shop Dubai",
  "e-liquids": "Buy E-Liquids & Salt Nicotine Juice in Dubai | Vape Shop Dubai",
  "vape-e-juice": "Vape E-Juice & E-Liquids in UAE | Vape Shop Dubai",
  "juul-vape-dubai": "JUUL Dubai UAE | Buy Original JUUL Pods & Devices",
  "juul": "JUUL Pods & Devices in Dubai | Vape Shop Dubai",
  "juul-1-series": "JUUL 1 Series Devices & Pods | Vape Shop Dubai",
  "juul-2-series": "JUUL 2 Series Devices & Pods | Vape Shop Dubai",
  "juul-pods-offers": "JUUL Pods Special Offers & Bundles | Vape Shop Dubai",
  "myle-vape-dubai": "MYLE Vape Dubai | Buy MYLE V5 & Disposable Pods",
  "myle": "MYLE Pod Systems & Disposables | Vape Shop Dubai",
  "myle-v5-pods": "MYLE V5 Meta Pods in Dubai | Vape Shop Dubai",
  "myle-v5-device": "MYLE V5 Meta Devices in Dubai | Vape Shop Dubai",
  "myle-disposable": "MYLE Disposable Vapes in Dubai | Vape Shop Dubai",
  "al-fakher-vape": "Al Fakher Crown Bar Vape in Dubai | Vape Shop Dubai",
  "elf-bar-vape": "Elf Bar Disposable Vapes in Dubai | Vape Shop Dubai",
  "fummo-vape": "Fummo Disposable Vapes in Dubai | Vape Shop Dubai",
  "pod-salt-vape": "Pod Salt Nicotine E-Liquids in Dubai | Vape Shop Dubai",
  "vapes-bars": "Vapes Bars Ghost Pro in Dubai | Vape Shop Dubai",
  "vozol-vape": "Vozol Disposable Vapes in Dubai | Vape Shop Dubai",
  "tugboat-vape": "Tugboat Disposable Vapes in Dubai | Vape Shop Dubai",
  "hqd-vape": "HQD Disposable Vapes in Dubai | Vape Shop Dubai",
  "lost-mary-disposable": "Lost Mary Disposable Vapes in Dubai | Vape Shop Dubai",
  "maskking-vape": "Maskking Disposable Vapes in Dubai | Vape Shop Dubai",
  "geek-bar-disposable": "Geek Bar Disposable Vapes in Dubai | Vape Shop Dubai",
  "yuoto-vape": "Yuoto Disposable Vapes in Dubai | Vape Shop Dubai",
  "relx-vape": "Relx Pod Devices & Pods in Dubai | Vape Shop Dubai",
  "nerd-vape": "Nerd Disposable Vapes in Dubai | Vape Shop Dubai",
  "vgod-stig": "VGOD Stig & E-Liquids in Dubai | Vape Shop Dubai",
  "silvaper-vape": "Silvaper E-Liquids in Dubai | Vape Shop Dubai",
  "salt-nicotine": "Salt Nicotine E-Liquids in Dubai | Vape Shop Dubai",
  "freebase-e-liquid": "Freebase E-Liquids in UAE | Vape Shop Dubai",
  "pod-system": "Pod Systems & Kits in Dubai | Vape Shop Dubai",
  "pod-kit": "Pod Kits & Refillable Vapes in Dubai | Vape Shop Dubai",
  "pod-cartridge": "Pod Cartridges & Replacement Pods in UAE",
  "vape-coils": "Vape Coils & Atomizers in Dubai | Vape Shop Dubai",
  "oxva-vape": "OXVA Xlim Pod Kits & Cartridges in Dubai | Vape Shop Dubai",
  "uwell-vape": "Uwell Caliburn Pod Kits & Coils in Dubai | Vape Shop Dubai",
  "vaporesso-vape": "Vaporesso XROS Pod Kits & Coils in Dubai | Vape Shop Dubai",
  "smok-vape": "SMOK Nord & Novo Pod Systems in Dubai | Vape Shop Dubai",
  "geek-vape": "GeekVape Kits, Mods & Coils in Dubai | Vape Shop Dubai",
  "voopoo-vape": "VooPoo Drag & Argus Pod Kits in Dubai | Vape Shop Dubai",
  "best-seller-vape": "Best Seller Vapes in Dubai | Vape Shop Dubai",
  "flash-sale": "Flash Sale Vapes & Pods Deals | Vape Shop Dubai",
  "brand": "All Certified Vape Brands in UAE | Vape Shop Dubai",
};

const CANONICAL_COLLECTION_DESCRIPTIONS: Record<string, string> = {
  "accessories": "Shop replacement coils, pod cartridges, batteries, and vape accessories at Vape Shop Dubai. Same-day delivery across Dubai and UAE.",
  "disposable-vape": "Buy 100% authentic disposable vapes in Dubai. Top brands including Al Fakher, Elf Bar, Tugboat, Vozol & Geek Bar. 2-Hour fast delivery.",
  "disposables": "Browse top disposable vape devices in Dubai. Fast same-day delivery, cash on delivery, and 100% authentic products guaranteed.",
  "e-liquids": "Discover premium freebase and salt nicotine e-liquids in Dubai. Top flavors from Pod Salt, Nasty Juice, VGOD, and Dr Vapes.",
  "vape-e-juice": "Shop premium e-juices and vape liquids in UAE. High VG freebase & salt nic options with express delivery across Dubai.",
  "juul-vape-dubai": "Buy authentic JUUL 1 & JUUL 2 devices and pods in Dubai, UAE. 100% original guaranteed with same-day express delivery.",
  "juul": "Order genuine JUUL devices, replacement pods, and menthol flavors in Dubai. Fast 2-hour delivery across all UAE emirates.",
  "juul-1-series": "Explore JUUL 1 Series pods and devices. Available in 3% and 5% nicotine strengths with same-day delivery in Dubai.",
  "juul-2-series": "Shop JUUL 2 Series pods including Crisp Menthol and Virginia Tobacco. 100% original JUUL 2 pods delivered fast in Dubai.",
  "juul-pods-offers": "Get special bundle deals and offers on JUUL pods in Dubai. Fast delivery, authentic stock, cash and card on delivery.",
  "myle-vape-dubai": "Buy MYLE Meta V5 pods, devices, and disposable vapes in Dubai. Genuine MYLE products with same-day delivery across UAE.",
  "myle": "Shop MYLE pod systems, replacement pods, and disposables in Dubai. Original sealed stock with express 2-hour delivery.",
  "myle-v5-pods": "Original MYLE Meta V5 pods in Iced Mint, Sweet Tobacco & Fruit flavors. Fast same-day delivery in Dubai & Sharjah.",
  "myle-v5-device": "Buy authentic MYLE Meta V5 devices in Dubai. Sleek rechargeable battery design with cash on delivery available.",
  "myle-disposable": "Shop MYLE Micro & Drip disposable vapes in Dubai. High puff capacity, rich flavor profiles, and instant dispatch.",
  "al-fakher-vape": "Buy Al Fakher Crown Bar 8000 & 10000 puff disposables in Dubai. Authentic shisha flavors with express UAE delivery.",
  "elf-bar-vape": "Shop genuine Elf Bar disposable vapes in Dubai. BC5000, RAYA 6600, and top flavor range with cash on delivery.",
  "fummo-vape": "Buy Fummo Target & King disposable vapes in Dubai. Premium puff capacity and smooth airflow with fast UAE shipping.",
  "pod-salt-vape": "Shop Pod Salt Nexus & Evo nicotine salt e-liquids in Dubai. Smooth throat hit and intense flavor satisfaction.",
  "vapes-bars": "Buy Vapes Bars Ghost Pro 3500 puff disposables in Dubai. Genuine UK formulation with express delivery across UAE.",
  "vozol-vape": "Shop Vozol Gear 10000 & Star disposable vapes in Dubai. Fast-charging, durable design with rich flavor output.",
  "tugboat-vape": "Buy Tugboat Royal 13000, EVO 4500 & Super 24000 disposables in Dubai. 100% authentic with same-day delivery.",
  "hqd-vape": "Shop HQD Cuvie & Cuvie Plus disposable vapes in Dubai. Compact form factor and long-lasting battery life.",
  "lost-mary-disposable": "Buy Lost Mary BM6000 & OS5000 disposable vapes in Dubai. Genuine flavor selection with fast UAE delivery.",
  "maskking-vape": "Shop Maskking High GT & Apex disposable vapes in Dubai. Compact design, intense flavor, and instant dispatch.",
  "geek-bar-disposable": "Buy Geek Bar Pulse & DF9000 disposable vapes in Dubai. Dual mesh coil tech with express delivery across UAE.",
  "yuoto-vape": "Shop Yuoto Thanatos 5000 & XXL 2500 puff disposables in Dubai. Reliable performance with cash on delivery.",
  "relx-vape": "Buy Relx Infinity & Essential pod kits and pro pods in Dubai. Premium sleek vaping devices with fast UAE delivery.",
  "nerd-vape": "Shop Nerd 5000 puff disposable vapes in Dubai. Mesh coil technology and rich e-liquid capacity.",
  "vgod-stig": "Buy VGOD Stig disposables & Cubano salt nic e-liquids in Dubai. Premium tobacco and menthol flavor profiles.",
  "silvaper-vape": "Shop Silvaper premium e-liquids in Dubai. Handcrafted flavor formulations for sub-ohm and pod devices.",
  "salt-nicotine": "Buy salt nicotine e-liquids in Dubai. Smooth 20mg, 30mg & 50mg nic salts for pod systems with fast UAE shipping.",
  "freebase-e-liquid": "Shop freebase e-liquids in 3mg & 6mg strengths in Dubai. High VG formulation for sub-ohm cloud chasing.",
  "pod-system": "Buy top pod system vape kits in Dubai. Refillable and pre-filled pod devices from Uwell, Vaporesso, VooPoo & SMOK.",
  "pod-kit": "Shop compact refillable pod kits in Dubai. Easy draw-activated devices with same-day express delivery.",
  "pod-cartridge": "Buy replacement pod cartridges in Dubai for Caliburn, XROS, Xlim, and Nord devices. 100% authentic stock.",
  "vape-coils": "Shop replacement vape coils and atomizers in Dubai. Genuine coils for Vaporesso, GeekVape, SMOK & Voopoo.",
  "oxva-vape": "Buy OXVA Xlim Pro & SQ pod kits in Dubai. Top-rated flavor extraction and leak-resistant pod design.",
  "uwell-vape": "Buy Uwell Caliburn G3, A3 & GK3 pod kits in Dubai. Legendary flavor production with fast UAE shipping.",
  "vaporesso-vape": "Buy Vaporesso XROS 3, XROS 4 & Luxe pod kits in Dubai. Leak-proof SSS tech and long-lasting mesh pods.",
  "smok-vape": "Shop SMOK Nord 5, Novo 4 & RPM pod kits in Dubai. Powerful battery capacity and wide coil compatibility.",
  "geek-vape": "Buy GeekVape Aegis Legend, Sonder Q & B60 kits in Dubai. Durable shockproof designs with fast delivery.",
  "voopoo-vape": "Shop VooPoo Drag X, Argus P1 & V.THRU pod kits in Dubai. Gene chip performance with same-day delivery.",
  "best-seller-vape": "Shop top-selling vapes, disposables, and e-liquids in Dubai. Best customer ratings and highest demand items.",
  "flash-sale": "Grab flash sale discounts on top vape brands in Dubai. Limited-time offers on pods, disposables, and e-liquids.",
  "brand": "Browse all official vape brands in UAE. JUUL, MYLE, Vaporesso, Uwell, Elf Bar, Al Fakher & 50+ genuine labels.",
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { handle } = await params;
  const sParams = searchParams ? await searchParams : {};
  const subFilter = typeof sParams?.sub === "string" ? sParams.sub : "";
  const brandFilter = typeof sParams?.brand === "string" ? sParams.brand : "";
  const hKey = (handle || "").toLowerCase();

  let title = CANONICAL_COLLECTION_TITLES[hKey] || `${handle.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} | Vape Shop Dubai`;
  let description = CANONICAL_COLLECTION_DESCRIPTIONS[hKey] || `Shop authentic ${title} products at Vape Shop Dubai with fast 2-hour delivery in Dubai and cash on delivery across the UAE.`;

  try {
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
    const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (SHOPIFY_STORE && ADMIN_TOKEN) {
      const res = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query getCollectionSEO($handle: String!) {
              collectionByHandle(handle: $handle) {
                title
                seo {
                  title
                  description
                }
              }
            }
          `,
          variables: { handle },
        }),
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const json = await res.json();
        const collection = json?.data?.collectionByHandle;
        if (collection) {
          if (collection.seo?.title) title = collection.seo.title;
          if (collection.seo?.description) description = collection.seo.description;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching collection SEO metadata:", error);
  }

  // Handle URL filter query params (?sub=, ?brand=) for unique title & description
  if (subFilter || brandFilter) {
    const filterRaw = subFilter || brandFilter;
    const filterName = filterRaw
      .split(/[-_\s]+/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    title = `${filterName} | ${title}`;
    description = `Explore authentic ${filterName} products under ${title}. Express 2-hour delivery available in Dubai & UAE.`;
  }

  if (title.length > 65 && title.includes(" | Vape Shop Dubai")) {
    title = title.replace(" | Vape Shop Dubai", "");
  }

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    }
  };
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
