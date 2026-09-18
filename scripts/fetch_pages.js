const fs = require('fs');

async function fetchPageContent(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Simple regex to extract content inside the main <div class="rte"> or <div class="page-content">
    // Looking at the theme WoodMart, the page content is usually inside a container with 'post-content' or 'rte'
    let match = html.match(/<div[^>]*class="[^"]*(?:rte|post-content)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
    
    // If not found, let's try a broader match for page width
    if (!match) {
        match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    }
    
    if (match) {
      // Strip out scripts and styles to clean it up
      let cleanHtml = match[1].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      console.log(`--- Content from ${url} ---`);
      console.log(cleanHtml.trim().slice(0, 1500) + '...\n\n');
      return cleanHtml.trim();
    } else {
      console.log(`Could not extract content from ${url}`);
      return null;
    }
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  const urls = [
    'https://vapshopdubai.ae/pages/about-us',
    'https://vapshopdubai.ae/pages/contact',
    'https://vapshopdubai.ae/pages/refund_returns',
    'https://vapshopdubai.ae/pages/shipping-guidelines'
  ];
  
  for (const url of urls) {
    const html = await fetchPageContent(url);
    if (html) {
      fs.writeFileSync(`scripts/scraped_${url.split('/').pop()}.html`, html);
    }
  }
}

main();
