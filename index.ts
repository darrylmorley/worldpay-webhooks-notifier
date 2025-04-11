import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import nodemailer from "nodemailer";

// Define webhook event interface based on Worldpay documentation
interface WorldpayWebhookEvent {
  eventId?: string;
  eventTimestamp?: string;
  eventDetails?: {
    classification?: string;
    type?: string;
    date?: string;
    transactionReference?: string;
    downstreamReference?: string;
  };
  eventType?: string;
  transactionReference?: string;
  amount?: {
    value?: number;
    currencyCode?: string;
  };
  [key: string]: any;
}

// Configuration
const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  email: {
    recipient: process.env.EMAIL_RECIPIENT || "your-email@example.com",
    smtp: {
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "username",
        pass: process.env.SMTP_PASS || "password",
      },
    },
  },
  // Worldpay IP allowlist as per the documentation
  worldpayIPs: [
    "34.246.73.11",
    "52.215.22.123",
    "52.31.61.0",
    "35.170.209.108",
    "35.177.246.6",
    "52.4.68.25",
    "52.51.12.88",
    "108.129.30.203",
    "18.130.125.132",
    "35.176.91.145",
    "52.56.235.128",
    "18.185.7.67",
    "18.185.134.117",
    "18.185.158.215",
    "52.48.6.187",
    "34.243.65.63",
    "3.255.13.18",
    "3.251.36.74",
    "63.32.208.6",
    "52.19.45.138",
    "3.11.50.124",
    "3.11.213.43",
    "3.14.190.43",
    "3.121.172.32",
    "3.125.11.252",
    "3.126.98.120",
    "3.139.153.185",
    "3.139.255.63",
    "13.200.51.10",
    "13.200.56.25",
    "13.232.151.127",
    "34.236.63.10",
    "34.253.172.98",
  ],
};

// Set up email transporter
const transporter = nodemailer.createTransport(config.email.smtp);

// Helper function to validate if a request is coming from Worldpay
function isWorldpayIP(ip: string): boolean {
  return config.worldpayIPs.includes(ip);
}

// Function to send email notification
async function sendEmailNotification(
  eventType: string,
  eventDetails: WorldpayWebhookEvent
) {
  const mailOptions = {
    from: config.email.smtp.auth.user,
    to: config.email.recipient,
    subject: `Worldpay Payment Event: ${eventType}`,
    html: `
      <h1>New Worldpay Payment Event: ${eventType}</h1>
      <p>Event Time: ${new Date(
        eventDetails.eventTimestamp || eventDetails.eventDetails?.date || ""
      ).toLocaleString()}</p>
      <h2>Event Details:</h2>
      <pre>${JSON.stringify(eventDetails, null, 2)}</pre>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent for event: ${eventType}`);
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}

// Create the Elysia app with CORS middleware
const app = new Elysia().use(cors()).onError(({ code, error, set }) => {
  console.error(`Error: ${code}`, error);
  set.status = 500;
  return { success: false, error: "Internal server error" };
});

// Worldpay webhook endpoint
app.post("/webhook", async ({ request, body, set }) => {
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") ||
    "";

  // Validate if the request is coming from Worldpay
  // Note: In production, you should enforce this check
  if (!isWorldpayIP(clientIP)) {
    console.warn(`Request from unauthorized IP: ${clientIP}`);
    // For development purposes, we're allowing all IPs, but logging a warning
    // In production, uncomment the following lines:
    // set.status = 403;
    // return { success: false, message: 'Unauthorized IP' };
  }

  try {
    const webhookEvent = body as WorldpayWebhookEvent;
    // Process the webhook event
    const eventType = webhookEvent.eventDetails?.type || webhookEvent.eventType;

    if (!eventType) {
      set.status = 400;
      return { success: false, message: "Invalid webhook payload" };
    }

    console.log(`Received webhook event: ${eventType}`);
    console.log("Event details:", JSON.stringify(webhookEvent, null, 2));

    // Payment events we're interested in (based on Worldpay documentation)
    const paymentEvents = [
      "sentForAuthorization",
      "authorized",
      "sentForSettlement",
      "cancelled",
      "error",
      "expired",
      "refused",
      "sentForRefund",
      "refundFailed",
      "tokenCreated",
    ];

    if (paymentEvents.includes(eventType)) {
      // Send email notification for payment events
      await sendEmailNotification(eventType, webhookEvent);
    }

    // Event acknowledgement - respond with 200 status code
    // as required by Worldpay to confirm receipt
    set.status = 200;
    return { success: true, message: "Event received" };
  } catch (error) {
    console.error("Error processing webhook:", error);
    set.status = 500;
    return { success: false, message: "Error processing webhook" };
  }
});

// Health check endpoint
app.get("/health", () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start the server
app.listen(config.server.port, () => {
  console.log(
    `🚀 Worldpay Webhook server is running at http://localhost:${config.server.port}`
  );
  console.log(
    `📧 Email notifications will be sent to: ${config.email.recipient}`
  );
});

export type App = typeof app;
