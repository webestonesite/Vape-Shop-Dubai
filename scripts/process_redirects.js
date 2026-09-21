const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const urls = `
/collections/juul-2-pods
/products/elfbar-ice-king-pro-40000-puffs-uae
/products/al-fakher-crown-bar-e-hose-x-60k
/products/al-fakher-crown-bar-mega-max
/product-category/juul-pods-offers
/collections
/index.php/product/juul-device-uae
/customer_authentication/redirect?locale=en&region_country=ae
/policies/terms-of-service
/product/tesla-bar-xt-30000-puffs-20mg
/product/vnsn-quake-ultra-30000-puffs-50mg
/product/tesla-bar-xt-40000-puffs-50mg
/vape-vibes-capturing-the-essence-of-vaping-with-myle-meta-bar-and-myle-micro-bar
/category/myle-meta-bar
/what-is-the-difference-between-juul-2-virginia-tobacco-and-juul-1-virginia-tobacco
/juul-2-virginia-tobacco-pods-a-trendy-choice-for-discerning-vapers
/category/juul-2-virginia-tobacco
/title-unmasking-tradition-our-in-depth-review-of-juul-1-virginia-tobacco-pods
/category/juul-1-virginia-tobacco
/why-is-your-disposable-vape-blinking
/category/myle-meta-box
/the-advantages-of-vaping-a-comprehensive-guide
/myle-v5-devices-the-best-ones-in-the-market
/category/myle-v5-pods
/juul-2-pods-best-products-and-flavors-extensive-overview
/exploring-the-two-amazing-options-crisp-menthol-juul-2-and-virginia-tobacco-juul-2
/category/virginia-tobacco-juul-2
/crisp-menthol-juul-2-and-myle-v5-pods-a-must-have-for-vapers
/category/crisp-menthol-juul-2
/vaping-vibes-unveiling-the-myle-drip-and-juul-2-pods-extravaganza-in-dubai
/tips-for-purchasing-a-vape-on-a-budget
/tips-to-maintain-juul-2-devices-ensure-the-longevity-of-your-devices
/author/juulsuperuser/page/5
/author/juulsuperuser/page/4
/product/tesiyi-ultra-shisha-6mg-nicotine-35000-puffs
/product/tesla-bar-25000-puffs-50mg
/difference-between-myle-meta-bar-and-myle-micro-bar
/category/myle-disposable
/blog/page/5
/blog/page/4
/juul-vape
/juul-2-device-uae-slate-grey-a-compact-and-modern-pod-system
/how-to-customize-your-juul-device-7-creative-ways
/what-makes-hayati-pro-ultra-s-50000-puffs-different-from-cheap-ones
/vgod-stig-disposable-vape-6-nicotine-compact-and-powerful-vaping
/exploring-juul-pods-in-the-uae
/desert-dreams-and-vapor-streams-unveiling-the-charms-of-juul-dubai-alongside-myle-v5-pods-delight
/elevating-your-vaping-game-with-juul-pods-unveiling-the-ultimate-experience-in-dubai
/how-to-refill-juul-pods-a-step-by-step-guide
/most-reliable-vape-brand-of-dubai-honest-review-of-juul-pods
/juul-pod-virginia-tobacco-5-a-classic-flavor-many-vapers-prefer
/category/juul-2-pods/page/2
/where-to-buy-juul-2-pods-a-complete-guide
/autumn-tobacco-juul-2-pods-18mg-a-smooth-tobacco-flavor
/watermelon-juul-2-pods-a-sweet-and-refreshing-fruit-flavor
/juul-2-pods-virginia-tobacco-18mg-a-classic-tobacco-flavor-experience
/juul-2-pods-a-smarter-upgrade-for-everyday-vaping
/author/juulsuperuser/page/6
/author/juulsuperuser/page/3
/author/juulsuperuser/page/2
/how-to-pick-the-right-vape-flavour
/make-2024-the-year-you-quit-smoking
/best-casinos-online-australia
/luck-in-casino-across-canada
/where-to-buy-juul-near-me-a-complete-guide-for-vapers
/new-aussie-online-casino-guide
/live-dealer-online-casino-australia
/why-modern-juul-pods-devices-are-more-advanced-than-ever
/product/vaporesso-armour-g-pod-kit
/product/geek-bar-pulse-25000-puffs
/product/tesiyi-40000-puffs-50mg
/product/beco-osens-xl-disposable-10000-puffs-50mg
/product/fitbar-shisha-30000-puffs-20mg
/product/vozol-gear-shisha-25000-puffs-3mg
/product/vnsn-quake-pro-14000-puffs
/product/elf-bar-ice-king-30000-puffs
/product/tugboat-master-10000-puffs
/product/pod-salt-nexus-12000-puffs
/product/oxva-xlim-top-fill-cartridge
/product/vaporesso-xros-4-nano-pod-kit
/product/vaporesso-armour-gs-pod-kit
/product/vaporesso-xros-3-nano-pod-kit
/product/vaporesso-xros-5-nano-pod-kit
/product/vaporesso-xros-3-mini-pod-kit
/product/vaporesso-xros-nano-pod-kit
/product/oxva-xlim-ez-cartridge
/product/isgo-bar-10000-puffs
/product/isgo-vegas-2800-puffs
/product/oxva-nexlim-pods-cartridge
/product/polar-menthol-juul-2-pods
/blog/page/6
/blog/page/3
/blog/page/2
/the-crisp-menthol-18-mg-by-juul-pods-becoming-everyones-favourite
/category/elf-bar-vape
/best-elf-bar-vape-device-for-smooth-flavor-and-strong-performance
/category/juul-2-devices
/juul-2-device-a-modern-pod-system-for-everyday-vaping
/category/juul-device
/juul-device-types-prices-and-why-many-users-still-choose-it
/autumn-tobacco-juul-2-pods-overview
/hayati-pro-ultra-s-50000-puffs-20mg-a-durable-disposable-vaporizer
/category/disposable-vape
/hayati-pro-ultra-s-50000-puffs-next-level-vaping-with-power-style-and-flavor
/category/juul-pods
/category/juul-2-pods
/peach-juul-2-pod-smooth-fruity-flavor-with-next-generation-juul-2-performance
/author/juulsuperuser
/category/uncategorized
/a-sleek-easy-and-satisfying-vaping-experience-juul-device
/product/voopoo-argus-g3-pod-kit
/product/voopoo-drag-x3-pod-kit
/product/voopoo-drag-s3-pod-kit
/product/geekvape-u-pod-series
/product/geekvape-q-pod-series
/product/geekvape-wenax-q-pro-pod-kit
/product/geekvape-wenax-q-pod-kit
/product/geekvape-wenax-q2-pod-kit
/product/geekvape-sonder-q2-pod-kit
/product/smok-nord-5-empty-pod
/product/smok-novo-5-pod
/product/smok-nord-5-pod-kit
/product/smok-novo-5-pod-kit
/product/oxva-xlim-ss-cartridge
/product/oxva-xlim-sq-pro-pod-kit
/product/oxva-xlim-sq-pro-2-pod-kit
/product/oxva-nexlim-vape-kit
/product/oxva-xlim-go-pod-kit
/product/oxva-nexlim-go-pod-kit
/product/oxva-xlim-pro-pod-kit
/product/oxva-xlim-pro-2-pod-kit
/product/oxva-xlim-pro-2-dna-pod-kit
/product/oxva-xlim-pro-3-pod-kit
/product/oxva-xlim-3-ultra-pod-kit
/product/smok-nord-coil
/product/smok-rpm-coil-series
/product/smok-rpm-3-coil-series
/product/smok-rpm-2-coil-series
/product/smok-lp1-coil-series
/product/smok-lp2-coil-series
/product/voopoo-pnp-x-coils
/product/voopoo-argus-v2-pods
/product/voopoo-argus-snap-pods
/product/voopoo-vmate-v2-pods
/product/voopoo-pnp-x-empty-pods
/product/vaporesso-xros-4-mini-pod-kit
/product/vaporesso-xros-5-mini-pod-kit
/product/vaporesso-xros-pro-pod-kit
/product/vaporesso-xros-pro-2-pod-kit
/product/vaporesso-xros-4-pod-kit
/product/vaporesso-xros-5-pod-kit
/product/vaporesso-luxe-q2-pod-kit
/product/vaporesso-luxe-q3-pod-kit
/product/vaporesso-luxe-xr-max-pod-kit
/product/vaporesso-luxe-xr-max-2-pod-kit
/product/silvaper-24000-puffs
/product/silvaper-40000-puffs-disposable
/product/vgod-4k-4000-puffs
/product/vgod-stig-disposable-vape
/product/nerd-slim-8000-puffs
/product/nerd-fire-10000-puffs
/product/yuoto-2500-puffs
/product/yuoto-3000-puffs
/product/yuoto-thanos-5000-puffs
/product/yuoto-digi-15000-puffs
/product/yuoto-kjv-16000-puffs
/product/geek-bar-50000-puffs
/product/maskking-gts-2500-puffs
/product/maskking-high-450-puffs
/product/lost-mary-mt15000-puffs-turbo
/product/lost-mary-bm15000-puffs
/product/hqd-cuvie-slick-6000-puffs-50mg
/product/tugboat-evo-4500-puffs
/product/vozol-star-12000-puffs
/product/vozol-star-20000-puffs
/product/ghost-pro-3500-puffs
/product/podsalt-nexus-3500-puffs
/product/podsalt-go-2500-puffs
/product/podsalt-pearl-6000-puffs
/product/pod-salt-nexus-6000-puffs
/product/pod-salt-pearl-pro-10000-puffs
/product/podsalt-onyx-cloud-25000-puffs
/product/pod-salt-35000-puffs
/product/pod-salt-15000-puffs
/product/fummo-king-6000-puffs
/product/fummo-magnum-8000-puffs
/product/fummo-power-15000-puffs
/product/elf-bar-10000-puffs-disposable-vape
/product/elf-bar-raya-d3-25000-puffs
/product/elfbar-moon-night-40000-puffs
/product/elf-bar-raya-d3-pro-30000-puffs
/product/al-fakher-pro-8000-puffs
/product/al-fakher-12000-puffs
/product/al-fakher-15000-puffs
/product/crown-bar-al-fakher-ultra-25000-puffs-5mg
/product/pyne-pod-boost-pro-20000-puffs-50mg
/product/pyne-pod-boost-8500-puffs-5
/product/vozol-gear-10000-puffs
/product/elf-bar-ew9000-prefilled-pod-kit-9000-puffs-50mg
/product/kief-king-35000-puffs-3mg
/product-category/best-seller-vape
/product/tugboat-t12000-puffs-disposable-vape
/product/pod-salt-onyx-4000-puffs
/product/myle-meta-box-5000-puffs-20mg
/product/racing-green-myle-v5-kit
/product/elite-white-myle-v5-kit
/product/navy-blue-myle-v5-kit
/product/jet-black-myle-v5-kit
/product/peach-mango-watermelon-myle-v5-pods
/product/mega-melon-myle-v5-pods
/product/iced-mint-myle-v5-pods
/product/blueberry-lemon-myle-v5-pods
/product/malaysian-mango-myle-v5-pods
/product/georgia-peach-myle-v5-pods
/product/pink-lemonade-myle-v5-pods
/product/red-apple-myle-v5-pods
/product/strawberry-slushy-myle-v5-pods
/product/sweet-tobacco-myle-v5-pods
/product/lush-ice-myle-v5-pods
/product/iced-tropical-fruit-myle-v5-pods
/product/autumn-tobacco-juul-2-pods
/product/summer-menthol-juul-2-pods
/product/ruby-menthol-juul-2-pods
/product/juul-2-device
/product/juul-pods-uae-menthol
/product/arctic-breeze-juul-2-pods
/product/tropical-medley-juul-2-pods
/product/lychee-juul-2-pods
/product/vaporesso-luxe-x3-pod-kit
/product/vaporesso-vibe-cartridge
/product/vaporesso-armour-g-series-pod
/product/vaporesso-luxe-x-pods
/product/vaporesso-luxe-xr-empty-pod
/product/vaporesso-gti-coils-series
/product/vaporesso-luxe-q-pods
/product/vaporesso-gtx-coil-series
/shipping-guidelines
/refund_returns
/product/crisp-menthol-juul-2-pods
/product/virginia-tobacco-juul-2-pods
/product/vaporesso-xros-pod-series
/product/uwell-caliburn-pods
/product/uwell-caliburn-g-pods
/product/uwell-caliburn-x-empty-pods
/product/pod-salt-shisha-8000-puffs
/product/lost-mary-turbo-mt35000-puffs
/product/crown-bar-adjustable-ice-al-fakher-15000-puffs
/product/beco-soft-6000-puffs-20mg-disposable-vape
/product/apple-juul-2-pods
/product/watermelon-juul-2-pods
/product/mango-juul-2-pods
/product/peach-juul-2-pod-in-dubai
/product/juul-pods-virginia-tobacco
/product/juul-pods-menthol
/product/juul-pod-virginia-tobacco
/product/juul-device-uae
/blog
/product-category/voopoo-vape
/product-category/geek-vape
/product-category/smok-vape
/product-category/uwell-vape
/product-category/brand
/product-category/vape-coils
/product-category/pod-cartridge
/product-category/pod-kit
/product-category/pod-system
/product-category/salt-nicotine
/product-category/vape-e-juice
/product-category/vgod-stig
/product-category/vozol-vape
/product-category/vapes-bars
/product-category/pod-salt-vape
/product-category/fummo-vape
/product-category/juul-vape-dubai
/shop
/product/elf-bar-bc10000-puffs
/product-category/yuoto-vape
/product/oxva-xlim-go-2-pod-kit
/apple-juul-2-pods-a-fresh-and-fruity-choice-for-adult-vapers
/is-juul-available-in-dubai-heres-what-you-need-to-know
/juul-pod-virginia-tobacco-5-a-classic-tobacco-experience-with-a-smooth-hit
/product-category/freebase-e-liquid
/product-category/myle-vape-dubai
/product-category/relx-vape
/product-category/hqd-vape
/product-category/silvaper-vape
/product/hqd-glaze-plus-12000-puffs-50mg
/product-category/maskking-vape
/product/beco-soft-max-12000-puffs-20mg
/product/blackcurrant-tobacco-juul-2-pods
/product-category/oxva-vape
/product-category/geek-bar-disposable
/elf-bar-raya-d3-pro-30000-puffs-a-high-capacity-disposable-vape-in-dubai
/where-to-buy-mango-juul-pods-your-ultimate-guide
/product-category/disposable-vape
/product-category/nerd-vape
/product-category/al-fakher-vape
/product-category/lost-mary-disposable
/collections/juul-2-device
/the-ultimate-guide-how-to-refill-juul-2-pods-like-a-pro
/product-category/elf-bar-vape
/product-category/tugboat-vape
/product-category/vaporesso-vape
/product-category/myle-disposable
/product-category/myle-v5-device
/product-category/myle-v5-pods
/product-category/juul-2-pods
/product-category/juul-2-kit
/product-category/juul-pods
/product-category/juul-1-kit
`.split('\n').filter(l => l.trim().length > 0);

const results = [];
const seen = new Set();

for (const urlStr of urls) {
  try {
    let pathName = urlStr.trim();
    // Normalize path by making sure it doesn't have the domain if present (it shouldn't here)
    if (pathName.startsWith('http')) {
        pathName = new URL(pathName).pathname;
    }

    // Strip out any query params if user copy-pasted them
    if (pathName.includes('?')) {
        pathName = pathName.split('?')[0];
    }
    
    // Remove trailing slash for consistency
    if (pathName.endsWith('/')) {
      pathName = pathName.slice(0, -1);
    }
    
    let oldPath = pathName;
    let newPath = pathName; // Default to same
    
    if (pathName.startsWith('/product-category/')) {
      const cleanPath = pathName.replace(/\/page\/\d+/g, '');
      const handle = cleanPath.replace('/product-category/', '');
      newPath = '/collections/' + handle;
    }
    else if (pathName.startsWith('/category/')) {
      const cleanPath = pathName.replace(/\/page\/\d+/g, '');
      const handle = cleanPath.replace('/category/', '');
      newPath = '/collections/' + handle;
    }
    else if (pathName.startsWith('/product/')) {
      const handle = pathName.replace('/product/', '');
      newPath = '/products/' + handle;
    }
    else if (pathName.startsWith('/index.php/product/')) {
      const handle = pathName.replace('/index.php/product/', '');
      newPath = '/products/' + handle;
    }
    else if (pathName.startsWith('/product-tag/')) {
      newPath = '/collections';
    }
    else if (pathName.startsWith('/shop')) {
      newPath = '/collections';
    }
    else if (pathName.startsWith('/author/')) {
      newPath = '/blogs/news';
    }
    else if (pathName.startsWith('/blog') || pathName === '/blog') {
      newPath = '/blogs/news';
    }
    else if (pathName.startsWith('/wishlist') || pathName.startsWith('/customer_authentication')) {
      newPath = '/';
    }
    else if (
        !pathName.startsWith('/products/') && 
        !pathName.startsWith('/collections/') && 
        !pathName.startsWith('/blogs/') &&
        !pathName.startsWith('/policies/') &&
        pathName !== '/' &&
        pathName !== '/collections'
    ) {
        // Likely a blog post based on the structure of the URLs provided (e.g. /tips-for-purchasing-a-vape-on-a-budget)
        newPath = '/blogs/news' + pathName;
    }
    
    // Check if it's already a good URL format that doesn't need redirecting
    if (oldPath.startsWith('/products/') || 
        oldPath.startsWith('/collections/') || 
        oldPath.startsWith('/policies/') ||
        oldPath === '/collections' ||
        oldPath === '/') {
        continue; // Skip these, they don't need redirects as they are valid Next.js paths
    }

    if (oldPath !== newPath && !seen.has(oldPath)) {
      seen.add(oldPath);
      results.push({
        id: crypto.randomUUID(),
        source: oldPath,
        destination: newPath
      });
    }
  } catch(e) {
      console.error(e);
  }
}

const REDIRECTS_FILE_PATH = path.join(__dirname, '..', 'data', 'redirects.json');
let existingData = { redirects: [] };

try {
  if (fs.existsSync(REDIRECTS_FILE_PATH)) {
    const raw = fs.readFileSync(REDIRECTS_FILE_PATH, 'utf8');
    existingData = JSON.parse(raw);
  }
} catch (e) {
  console.log("Creating new redirects file");
}

// Append new ones, avoiding duplicates by source
const finalRedirects = [...existingData.redirects];
const existingSources = new Set(finalRedirects.map(r => r.source));

for (const r of results) {
  if (!existingSources.has(r.source)) {
    finalRedirects.push(r);
  }
}

fs.writeFileSync(REDIRECTS_FILE_PATH, JSON.stringify({ redirects: finalRedirects }, null, 2), 'utf8');
console.log("Successfully appended " + (finalRedirects.length - existingData.redirects.length) + " new unique redirects to data/redirects.json!");
