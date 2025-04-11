// test-webhook.ts - Script to simulate a Worldpay webhook event
import { fetch } from "bun";

// Configure test parameters
const config = {
  webhookUrl: "https://worldpay-webhooks.shootingsuppliesltd.co.uk/webhook",
  // Sample event data based on Worldpay documentation
  eventData: {
    eventId: "test-event-123",
    eventTimestamp: new Date().toISOString(),
    eventDetails: {
      classification: "payment",
      type: "authorized", // Using one of the supported event types
      date: new Date().toISOString(),
      transactionReference: "order-" + Math.floor(Math.random() * 1000),
      downstreamReference: "payment-" + Math.floor(Math.random() * 1000)
    },
    amount: {
      value: 1999,
      currencyCode: "USD"
    }
  }
};

// Function to send a test webhook event
async function sendTestWebhook() {
  console.log("🚀 Sending test webhook event to:", config.webhookUrl);
  console.log("📦 Event payload:", JSON.stringify(config.eventData, null, 2));
  
  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Simulate a request from one of the Worldpay IPs
        "X-Forwarded-For": "34.246.73.11" 
      },
      body: JSON.stringify(config.eventData)
    });
    
    const responseData = await response.text();
    
    console.log(`✅ Response status: ${response.status}`);
    console.log("📬 Response body:", responseData);
    
    if (response.status === 200) {
      console.log("✅ Test webhook sent successfully!");
      console.log("📧 Check your email for the notification that should have been sent");
    } else {
      console.error("❌ Test failed. Server returned non-200 status code");
    }
  } catch (error) {
    console.error("❌ Error sending test webhook:", error);
    console.log("Make sure your server is running (bun run start)");
  }
}

// Execute the test
sendTestWebhook();