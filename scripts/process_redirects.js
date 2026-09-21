const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const urls = `
https://vapshopdubai.ae/collections/juul-pods
https://vapshopdubai.ae/product/juul-pods-uae-mango/
https://vapshopdubai.ae/product-category/juul-2-device/
https://vapshopdubai.ae/product-category/juul-device/
https://vapshopdubai.ae/product-category/myle-meta-box/
https://vapshopdubai.ae/product/juul-pods-uae-berry/
https://vapshopdubai.ae/product-category/myle-meta-bar/
https://vapshopdubai.ae/product-category/juul-pods/
https://vapshopdubai.ae/product-category/myle-meta-9000-puffs/
https://vapshopdubai.ae/product/geek-bar-pulse-25000-puffs/
https://vapshopdubai.ae/product/tugboat-royal-13000-puffs/
https://vapshopdubai.ae/product/vgod-4k-4000-puffs/
https://vapshopdubai.ae/product-tag/juul-pods-amazon/
https://vapshopdubai.ae/product/juul-pods-uae-mint/
https://vapshopdubai.ae/product/isgo-bar-10000-puffs/
https://vapshopdubai.ae/shop/page/2/
https://vapshopdubai.ae/product/meta-box-iced-mint/
https://vapshopdubai.ae/product/nerd-clouds-20000-puffs/
https://vapshopdubai.ae/product/nerd-alien-12k-puffs/
https://vapshopdubai.ae/product-category/disposable-vape/page/6/
https://vapshopdubai.ae/product-category/myle-micro-bar/
https://vapshopdubai.ae/product/vnsn-max-20000-puffs/
https://vapshopdubai.ae/product/meta-box-pineapple-coconut-strawberry/
https://vapshopdubai.ae/product/meta-box-white-grape-ice/
https://vapshopdubai.ae/products/tesiyi-ultra-shisha-6mg-nicotine-35000-puffs
https://vapshopdubai.ae/product/tesla-bar-xt-40000-puffs-50mg/
https://vapshopdubai.ae/product/meta-box-peach-ice/
https://vapshopdubai.ae/product/yuoto-kjv-16000-puffs/
https://vapshopdubai.ae/product-tag/buy-juul-pods-in-bulk/
https://vapshopdubai.ae/product/meta-box-french-vanilla/
https://vapshopdubai.ae/product/micro-bar-iced-quad-berry/
https://vapshopdubai.ae/product-tag/juul-ruby-menthol/
https://vapshopdubai.ae/product/geek-bar-hero-20000-puffs/
https://vapshopdubai.ae/product-tag/juul-2-review/
https://vapshopdubai.ae/product-category/myle-drip-disposable/
https://vapshopdubai.ae/product-category/myle-meta-box/page/2/
https://vapshopdubai.ae/product/myle-meta-iced-watermelon-9000-puffs/
https://vapshopdubai.ae/product-tag/myle-sharjah/
https://vapshopdubai.ae/product/geek-bar-23000-puffs/
https://vapshopdubai.ae/product-category/myle-disposable/page/3/?per_row=4&per_page=24&shop_view=grid
https://vapshopdubai.ae/product/tesiyi-ultra-shisha-6mg-nicotine-35000-puffs/
https://vapshopdubai.ae/product-tag/juul-pods-virginia-tobacco/
https://vapshopdubai.ae/product/vnsn-quake-10000-puffs/
https://vapshopdubai.ae/product/isgo-vegas-2800-puffs/
https://vapshopdubai.ae/product-tag/juul-pods-flavors-amazon/
https://vapshopdubai.ae/product/meta-box-skittlez/
https://vapshopdubai.ae/product/micro-bar-blue-razz/
https://vapshopdubai.ae/product-category/disposable-vape/page/3/
https://vapshopdubai.ae/product-category/disposable-vape/page/4/
https://vapshopdubai.ae/product/micro-bar-iced-mint/
https://vapshopdubai.ae/product/isgo-tokyo-4000-puffs/
https://vapshopdubai.ae/product/meta-bar-iced-mint/
https://vapshopdubai.ae/where-to-buy-maskking-vape-in-dubai/
https://vapshopdubai.ae/product-tag/myle-pod-price/
https://vapshopdubai.ae/product-tag/juul-2-pods-abu-dhabi/
https://vapshopdubai.ae/product-tag/juul-2-polar-menthol/
https://vapshopdubai.ae/product/isgo-paris-30000-puffs/
https://vapshopdubai.ae/product/myle-meta-miami-mint-9000-puffs/
https://vapshopdubai.ae/products/tugboat-master-10000-puffs
https://vapshopdubai.ae/product/meta-bar-lush-ice/
https://vapshopdubai.ae/product/meta-box-sweet-tobacco/
https://vapshopdubai.ae/product/yuoto-digi-15000-puffs/
https://vapshopdubai.ae/product-tag/myle-emirates-mall/
https://vapshopdubai.ae/product/fummo-spin-10000-puffs/
https://vapshopdubai.ae/product/vudu-filter-2500-puffs/
https://vapshopdubai.ae/product/micro-bar-pink-lemonade/
https://vapshopdubai.ae/product/vapes-bars-ghost-shisha/
https://vapshopdubai.ae/product-tag/vozol-disposable-best-flavor/
https://vapshopdubai.ae/product-tag/buy-juul-mango-pod/
https://vapshopdubai.ae/product/vapes-bars-7000-puffs/
https://vapshopdubai.ae/product/meta-box-malaysian-mango/
https://vapshopdubai.ae/product/elf-bar-ice-king-30000-puffs/
https://vapshopdubai.ae/product-tag/summer-menthol-juul-2-pod/?per_row=4&shop_view=grid
https://vapshopdubai.ae/product/meta-box-lush-ice/
https://vapshopdubai.ae/product-tag/new-juul-device/
https://vapshopdubai.ae/product/elf-bar-2600-puffs/
https://vapshopdubai.ae/product-tag/juul-dubai-duty-free/
https://vapshopdubai.ae/product/micro-bar-sweet-tobacco/
https://vapshopdubai.ae/product-tag/buy-juul-pods-online/
https://vapshopdubai.ae/product/meta-box-red-apple/
https://vapshopdubai.ae/product-tag/myle-shop-near-me/page/3/
https://vapshopdubai.ae/product-tag/best-juul-compatible-pods/
https://vapshopdubai.ae/product-tag/myle-disposable-vape/
https://vapshopdubai.ae/product/tesla-bar-25000-puffs-50mg/
https://vapshopdubai.ae/product/nerd-crystal-5500-puffs/
https://vapshopdubai.ae/product/isgo-dram-box-6000-puffs/
https://vapshopdubai.ae/10-best-vape-brands-in-dubai-for-quality-performance-2026/
https://vapshopdubai.ae/product-tag/buy-myle-meta-box/
https://vapshopdubai.ae/product-tag/juul-2-pods-near-mjuul-2-pods-review/
https://vapshopdubai.ae/product-tag/juul-dubai-mall/
https://vapshopdubai.ae/product/micro-bar-strawberry-slushy/
https://vapshopdubai.ae/product/myle-drip-bano/
https://vapshopdubai.ae/product/tugboat-master-10000-puffs/
https://vapshopdubai.ae/product/podsalt-nexus-2000-puffs/
https://vapshopdubai.ae/product/myle-drip-white-gummy/
https://vapshopdubai.ae/product/micro-bar-banana-ice/
https://vapshopdubai.ae/product-tag/myle-meta-bar-review/
https://vapshopdubai.ae/product/isgo-paris-1500-puffs/
https://vapshopdubai.ae/product-tag/juul-vape-amazon/
https://vapshopdubai.ae/product-category/myle-micro-bar/page/2/
https://vapshopdubai.ae/product-tag/vozol-20000/
https://vapshopdubai.ae/product-tag/juul-2-pods-review/
https://vapshopdubai.ae/product-tag/myle-meta-device-review/
https://vapshopdubai.ae/product-tag/buy-juul-near-me/
https://vapshopdubai.ae/product-tag/buy-juul-pods/
https://vapshopdubai.ae/products/beco-osens-xl-disposable-10000-puffs-50mg
https://vapshopdubai.ae/product-category/disposable-vape/page/2/
https://vapshopdubai.ae/product-tag/vozol-vape/
https://vapshopdubai.ae/where-to-buy-juul-pods-near-you/
https://vapshopdubai.ae/product-tag/geek-bar-disposable/
https://vapshopdubai.ae/product/tugboat-pulse-20000-puffs/
https://vapshopdubai.ae/product/meta-box-iced-tropical-fruit/
https://vapshopdubai.ae/product/myle-drip-prime-pear/
https://vapshopdubai.ae/product-tag/juul-pods-price/
https://vapshopdubai.ae/product/elf-bar-5000-puffs-disposable-vape/
https://vapshopdubai.ae/product-tag/myle-meta-bar-2500-puffs/
https://vapshopdubai.ae/product-tag/juul-device-amazon/
https://vapshopdubai.ae/product/myle-meta-sweet-peach-9000-puffs/
https://vapshopdubai.ae/product-category/uwell-vape/page/2/
https://vapshopdubai.ae/product-tag/myle-price-in-uae/
https://vapshopdubai.ae/product-tag/myle-drip-2500-puffs/
https://vapshopdubai.ae/product-tag/myle-shop-near-me/
https://vapshopdubai.ae/product/myle-meta-lush-ice-9000-puffs/
https://vapshopdubai.ae/product/myle-drip-mango-ice/
https://vapshopdubai.ae/wishlist/
https://vapshopdubai.ae/product/meta-bar-georgia-peach/
https://vapshopdubai.ae/product-tag/vozol-vape-uae/
https://vapshopdubai.ae/product-tag/juul-vape-review/
https://vapshopdubai.ae/product-tag/myle-shop-near-me/page/2/
https://vapshopdubai.ae/product-tag/buy-juul-pods-dubai/
https://vapshopdubai.ae/product-tag/myle-meta-box/page/2/
https://vapshopdubai.ae/product/beco-osens-xl-disposable-10000-puffs-50mg/
https://vapshopdubai.ae/product-tag/juul-shop-sports-city/
https://vapshopdubai.ae/product/myle-meta-cuban-tobacco-9000-puffs/
https://vapshopdubai.ae/product/myle-micro-bar-blueberry/
https://vapshopdubai.ae/product-category/myle-disposable/page/3/
https://vapshopdubai.ae/product/vnsn-quake-ultra-30000-puffs-50mg/
https://vapshopdubai.ae/product-category/juul-2-kit/
https://vapshopdubai.ae/product/micro-bar-prime-pear/
https://vapshopdubai.ae/product-category/juul-1-kit/
https://vapshopdubai.ae/product/micro-bar-true-tobacco/
https://vapshopdubai.ae/product/myle-meta-iced-tropical-fruit-9000-puffs/
https://vapshopdubai.ae/product/elfbar-e-shisha-luxe-30000-puffs-disposable-vape/
https://vapshopdubai.ae/product/meta-bar-red-apple/
https://vapshopdubai.ae/product/meta-bar-sweet-tobacco/
https://vapshopdubai.ae/product-tag/juul-2-device/
https://vapshopdubai.ae/product-tag/myle-drip-los-ice-uae/
https://vapshopdubai.ae/product-category/disposable-vape/page/5/
https://vapshopdubai.ae/product/myle-meta-box-5000-puffs-50mg/
https://vapshopdubai.ae/products/vozol-gear-shisha-25000-puffs-3mg
https://vapshopdubai.ae/products/elf-bar-ice-king-30000-puffs
https://vapshopdubai.ae/product/myle-drip-sweet-mango/
https://vapshopdubai.ae/product-tag/myle-disposable/
https://vapshopdubai.ae/product/tugboat-super-16000-puffs-battery-pack-550mah-in-dubai/
https://vapshopdubai.ae/product-tag/buy-juul-vape/
https://vapshopdubai.ae/product/meta-box-georgia-peach/
https://vapshopdubai.ae/product/tugboat-super-16000-pod-cartridges/
https://vapshopdubai.ae/product-tag/juul-2-device-review/
https://vapshopdubai.ae/product/myle-drip-los-ice/
https://vapshopdubai.ae/product-tag/jol-pod-dubai/
https://vapshopdubai.ae/product-tag/juul-2-crisp-menthol/
https://vapshopdubai.ae/product/meta-box-blueberry-lemon/
https://vapshopdubai.ae/product/micro-bar-mega-melon/
https://vapshopdubai.ae/product/uwell-caliburn-g5-pod-kit/
https://vapshopdubai.ae/product/vozol-gear-shisha-25000-puffs-3mg/
https://vapshopdubai.ae/product-tag/juul-2-pod-autumn-tobacco/
https://vapshopdubai.ae/product/geek-bar-pulse-15000-puffs/
https://vapshopdubai.ae/product/myle-meta-lemon-mint-9000-puffs/
https://vapshopdubai.ae/product-category/uncategorized/
https://vapshopdubai.ae/product/myle-meta-strawberry-ice-9000-puffs/
https://vapshopdubai.ae/product-tag/juul-shop-near-me/
https://vapshopdubai.ae/product/hayati-pro-ultra-s-50000-puffs-20mg/
https://vapshopdubai.ae/product-tag/myle-drip-review/
https://vapshopdubai.ae/product-tag/myle-disposable-price/?per_page=24
https://vapshopdubai.ae/product/meta-box-melon-honeydew/
https://vapshopdubai.ae/product/vozol-gear-10000-puffs-disposable-vape-50mg/
https://vapshopdubai.ae/product/pod-salt-nexus-12000-puffs/
https://vapshopdubai.ae/product/myle-meta-iced-mint-9000-puffs/
https://vapshopdubai.ae/product/myle-drip-green-apple-ice/
https://vapshopdubai.ae/product-tag/myle-meta-bar-online/
https://vapshopdubai.ae/product/myle-meta-frozen-mango-9000-puffs/
https://vapshopdubai.ae/vozol-vape-guide-2026/
https://vapshopdubai.ae/product/elf-bar-ew9000-prefilled-pod-kit-9000-puffs-50mg-disposable-vape/
https://vapshopdubai.ae/product-tag/myle-meta-box-price/page/2/?shop_view=grid&per_row=4
https://vapshopdubai.ae/product-tag/juul-shop-ras-al-khaimah/
https://vapshopdubai.ae/product/micro-bar-red-apple/
https://vapshopdubai.ae/product-tag/myle-1500-puffs-disposable/page/2/
https://vapshopdubai.ae/product/myle-drip-sweet-tobacco/
https://vapshopdubai.ae/product/juul-2-pods-virginia-tobacco/
https://vapshopdubai.ae/products/geek-bar-pulse-25000-puffs
https://vapshopdubai.ae/products/tesla-bar-xt-40000-puffs-50mg
https://vapshopdubai.ae/product-category/pod-cartridge/
https://vapshopdubai.ae/products/yuoto-kjv-16000-puffs
https://vapshopdubai.ae/products/pod-salt-nexus-12000-puffs
https://vapshopdubai.ae/collections/juul-1-kit
https://vapshopdubai.ae/collections/juul-2-kit
https://vapshopdubai.ae/products/vnsn-quake-ultra-30000-puffs-50mg
https://vapshopdubai.ae/products/vgod-4k-4000-puffs
https://vapshopdubai.ae/products/isgo-bar-10000-puffs
https://vapshopdubai.ae/products/isgo-vegas-2800-puffs
https://vapshopdubai.ae/products/tesla-bar-xt-40000-puffs-50mg
https://vapshopdubai.ae/products/yuoto-digi-15000-puffs
https://vapshopdubai.ae/products/tesla-bar-25000-puffs-50mg
https://vapshopdubai.ae/products/elf-bar-ice-king-30000-puffs
`.split('\n').filter(l => l.trim().length > 0);

const results = [];
const seen = new Set();

for (const urlStr of urls) {
  try {
    const url = new URL(urlStr.trim());
    let pathName = url.pathname;
    
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
    else if (pathName.startsWith('/product/')) {
      const handle = pathName.replace('/product/', '');
      newPath = '/products/' + handle;
    }
    else if (pathName.startsWith('/product-tag/')) {
      newPath = '/collections';
    }
    else if (pathName.startsWith('/shop')) {
      newPath = '/collections';
    }
    else if (pathName.startsWith('/wishlist')) {
      newPath = '/';
    }
    else if (pathName === '/where-to-buy-maskking-vape-in-dubai' || 
             pathName === '/10-best-vape-brands-in-dubai-for-quality-performance-2026' ||
             pathName === '/where-to-buy-juul-pods-near-you' ||
             pathName === '/vozol-vape-guide-2026') {
      newPath = '/blogs/news' + pathName;
    }
    
    if (oldPath !== newPath && !seen.has(oldPath)) {
      seen.add(oldPath);
      results.push({
        id: crypto.randomUUID(),
        source: oldPath,
        destination: newPath
      });
    }
  } catch(e) {}
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
console.log("Successfully appended " + results.length + " redirects to data/redirects.json!");
