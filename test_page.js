const url = 'https://vap-shop-dubai.myshopify.com/api/2024-10/graphql.json';
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'a6abf4cb36bf09d8460ab03b7db2998a'; 
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token
  },
  body: JSON.stringify({ query: '{ pageByHandle(handle: "contact") { id title } }' })
}).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(console.error);
