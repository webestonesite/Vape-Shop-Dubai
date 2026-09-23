import { NextResponse } from "next/server";
import { fetchLiveWebsiteProducts, LiveProductItem } from "@/lib/getStoreProducts";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

function cleanTitleForHuman(title: string): string {
  return title
    .replace(/\s+in\s+UAE/gi, "")
    .replace(/^Buy\s+/gi, "")
    .trim();
}

function getRelevantProductsForPrompt(userMessage: string, liveProducts: LiveProductItem[]): LiveProductItem[] {
  if (!liveProducts || liveProducts.length === 0) return [];
  const query = userMessage.toLowerCase();

  const tokens = query.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length >= 2);

  const matched = liveProducts.filter(p => {
    const title = p.name.toLowerCase();
    const brand = p.brand.toLowerCase();
    const cat = p.category.toLowerCase();
    return tokens.some(t => title.includes(t) || brand.includes(t) || cat.includes(t));
  });

  if (matched.length > 0) {
    return matched.slice(0, 20);
  }

  return liveProducts.slice(0, 20);
}

export async function POST(req: Request) {
  try {
    // Basic rate limit by IP (15 requests per minute for chat)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    try {
      await limiter.check(15, ip);
    } catch {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment." },
        { status: 429 }
      );
    }

    console.log("KEYS:", { OR: !!process.env.OPENROUTER_API_KEY, GROQ: !!process.env.GROQ_API_KEY, NV: !!process.env.NVIDIA_API_KEY });
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // DYNAMIC DOMAIN DETECTION
    const hostHeader = req.headers.get("host") || "";
    const originHeader = req.headers.get("origin") || "";
    const protocol = hostHeader.includes("localhost") ? "http" : "https";
    const fallbackHost = hostHeader ? `${protocol}://${hostHeader}` : (process.env.NEXT_PUBLIC_SITE_URL || "https://vapeshopdubai.webestone.net");
    const siteUrl = originHeader || fallbackHost;

    // INTENTION THINKING PAUSE FOR THOUGHTFUL ANALYSIS
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const BASE_STORE_POLICIES = `You are the official AI Sales Assistant for "Vape Shop Dubai" (${siteUrl}).
You have deep vape industry knowledge.

THINKING & UNDERSTANDING PROCESS (CRITICAL):
1. ANALYZE INTENT & LANGUAGE: Carefully determine exactly what the customer wants and the language they are using (e.g., Bengali slang, Arabic, English).
2. MATCH CUSTOMER LANGUAGE: You MUST respond in the EXACT same language the customer used. Do not force English if they speak Bengali or Arabic.
3. SEARCH DATABASE: Check the provided RELEVANT STORE PRODUCTS DATABASE to see if their requested item is in stock.
4. ADDRESS AS SIR: Always address the customer politely as "Sir" (translated if necessary). Do not use informal terms like "bhai" or "brother".

YOUR PERSONALITY:
- Be as smart and helpful as ChatGPT.
- Give honest expert opinions when relevant.
- Sound natural, polite, and professional on WhatsApp.

WEBSITE LINKS:
- Disposables: ${siteUrl}/collections/disposable-vape
- JUUL: ${siteUrl}/collections/juul
- Pod Systems: ${siteUrl}/collections/pod-system
- E-Liquids: ${siteUrl}/collections/e-liquid
- Salt Nicotine: ${siteUrl}/collections/salt-nicotine
- Myle: ${siteUrl}/collections/myle
- Blog: ${siteUrl}/blog
- Sitemap: ${siteUrl}/sitemap.xml

CRITICAL FORMATTING RULES:
- NEVER use ** or any markdown formatting. Write plain text only.
- When mentioning a specific product, include its product link: ${siteUrl}/products/{product-handle}
- Answer ONLY what the customer asked.
- Keep replies SHORT and DIRECT like a WhatsApp chat.

STORE POLICIES:
- Store Name: Vape Shop Dubai
- Website: ${siteUrl}
- Hotline / WhatsApp: +971582839787
- 2-Hour Express Delivery across Dubai. Same-day for Abu Dhabi, Sharjah, UAE.
- FREE shipping on 300 AED+ orders. Standard delivery 25 AED.
- Cash/Card on Delivery available.`;

    const lastUserMessageObj = [...messages].reverse().find((m: any) => m.role === "user");
    const lastUserMessage = lastUserMessageObj?.content || "";

    // JINA READER URL SCRAPING
    let scrapedContext = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = lastUserMessage.match(urlRegex) || [];
    if (urls.length > 0) {
      const urlsToScrape = urls.slice(0, 2); // Max 2
      for (const url of urlsToScrape) {
        try {
          const jinaRes = await fetch(`https://r.jina.ai/${url}`, { headers: { "Accept": "text/plain" }});
          if (jinaRes.ok) {
            const jinaText = await jinaRes.text();
            scrapedContext += `\n\n--- SCRAPED CONTENT FROM ${url} ---\n${jinaText.substring(0, 3000)}\n---------------------------\n`;
          }
        } catch (e) {
          console.warn("Jina scrape failed for", url, e);
        }
      }
    }

    // 1. DYNAMICALLY SCAN ALL REAL PRODUCTS FROM LIVE WEBSITE DATABASE
    const liveProducts = await fetchLiveWebsiteProducts();

    // 2. DYNAMICALLY FILTER RELEVANT PRODUCTS FOR FAST 0.2s PROMPT
    const relevantProducts = getRelevantProductsForPrompt(lastUserMessage, liveProducts);

    const liveProductsPromptText = relevantProducts.length > 0
      ? relevantProducts.map((p) => `Product: "${cleanTitleForHuman(p.name)}" | Handle: ${p.handle} | Brand: ${p.brand} | Price: ${p.price} AED | Status: ${p.isAvailable ? "In Stock" : "Sold Out"}`).join("\n")
      : "No matching products found in database currently.";

    let FULL_SYSTEM_PROMPT = `${BASE_STORE_POLICIES}\n\nRELEVANT STORE PRODUCTS DATABASE:\n${liveProductsPromptText}`;
    if (scrapedContext) {
      FULL_SYSTEM_PROMPT += `\n\nUSER PROVIDED LINKS CONTEXT:\nThe user shared a link. Here is its content to help you answer:\n${scrapedContext}`;
    }

    // Filter valid messages format for AI APIs
    const validMessages = messages.filter((m: any) => m.content && m.content.trim());
    const formattedMessages = [
      { role: "system", content: FULL_SYSTEM_PROMPT },
      ...validMessages.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))
    ];

    // 3. TRY PRIMARY AI ENGINE: OPENROUTER
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": siteUrl,
            "X-Title": "Vape Shop Dubai AI Chat"
          },
          body: JSON.stringify({
            model: "openrouter/free", // Forces a free model with high limits
            messages: formattedMessages,
            temperature: 0.5,
            max_tokens: 600
          })
        });
        clearTimeout(timeoutId);

        if (orRes.ok) {
          const orData = await orRes.json();
          let reply = orData.choices?.[0]?.message?.content;
          if (reply && reply.trim()) {
            reply = reply.replace(/\/product\//g, "/products/");
            reply = reply.replace(/\*/g, "");
            return NextResponse.json({ reply: reply.trim() });
          }
        } else {
          const errorData = await orRes.text();
          console.error("OpenRouter API Error:", orRes.status, errorData);
        }
      } catch (err) {
        console.warn("OpenRouter API timeout/error, trying fallback:", err);
      }
    }

    // 5. GRACEFUL NETWORK FALLBACK
    return NextResponse.json({ reply: "Hello Sir! 👋 We are experiencing high traffic right now. Please message us directly on WhatsApp at +971582839787 so we can assist you immediately! 📱" });

  } catch (error: any) {
    console.error("Chat API Route error:", error);
    return NextResponse.json({ reply: "Hello Sir! 👋 We are experiencing high traffic right now. Please message us directly on WhatsApp at +971582839787 so we can assist you immediately! 📱" }, { status: 200 });
  }
}
