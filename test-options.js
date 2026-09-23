const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const storeDomain = process.env.SHOPIFY_STORE;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;
  
  const res = await fetch(`https://${storeDomain}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: `
        query {
          products(first: 5, query: "Virginia") {
            edges {
              node {
                handle
                title
                options {
                  name
                  values
                }
                variants(first: 5) {
                  edges {
                    node {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      `
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
