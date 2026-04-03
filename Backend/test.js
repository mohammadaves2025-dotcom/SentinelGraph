const axios = require('axios');

const HOST = "https://tg-42239feb-f968-40ad-83d2-5fca5daea132.tg-2635877100.i.tgcloud.io";
const SECRET = "bebdq0hri52em5q2ma7mdfrislghvrua"; 

async function testConnection() {
    console.log("🚀 Hitting the new TG 4.x Auth Endpoint...");
    try {
        // The V4.x Savanna Endpoint!
        const targetUrl = `${HOST}/gsql/v1/tokens`;
        
        const response = await axios.post(targetUrl, {
            secret: SECRET
        });
        
        console.log("✅ TOKEN GENERATED SUCCESSFULLY!");
        
        // TG 4.x sometimes structures the response slightly differently, so we log the whole thing:
        console.log("Response:", response.data);
        
    } catch (error) {
        const isHtml = typeof error?.response?.data === 'string' && error?.response?.data.includes('<html');
        console.error("❌ FAILED:", isHtml ? "HTML 400 Bad Request" : (error?.response?.data || error.message));
    }
}

testConnection();