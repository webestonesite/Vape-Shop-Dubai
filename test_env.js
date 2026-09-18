require('dotenv').config({ path: '.env.local' });

const url = 'https://' + process.env.SHOPIFY_STORE + '/api/2024-10/graphql.json';
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_API_KEY; 

const q1 = `
    query getPage($handle: String!) {
      page(handle: $handle) {
        id
        title
        handle
        body
        bodySummary
        seo {
          title
          description
        }
      }
    }
  `;

async function test() {
  let r1 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query: q1, variables: { handle: "contact" } })
  });
  console.log("page:", await r1.json());
}
test();
