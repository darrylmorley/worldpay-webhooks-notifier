# Worldpay Webhooks Email Notification System

This project provides a webhook handler for Worldpay payment events that sends email notifications when new payment events occur.

## Features

- Receives Worldpay webhook events
- Validates webhook requests from Worldpay IPs
- Sends email notifications for payment events
- Acknowledges webhook events with proper status codes
- Health check endpoint for monitoring

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- SMTP server for sending emails
- A publicly accessible URL (for production use)
- Worldpay account with webhooks configured to point to your server

## Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   bun install
   ```

## Configuration

The application uses environment variables for configuration. You can set these in a `.env` file or directly in your environment.

```bash
# Server configuration
PORT=3000

# Email configuration
EMAIL_RECIPIENT=your-email@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASS=password
```

## Running the Application

### Development

```bash
bun run index.ts
```

### Production

For production, you might want to use a process manager like PM2:

```bash
npm install -g pm2
pm2 start --interpreter ~/.bun/bin/bun index.ts --name worldpay-webhooks
```

## Docker Deployment

This project includes a Dockerfile for easy containerization.

### Building the Docker Image

```bash
docker build -t worldpay-webhooks .
```

### Running with Docker

```bash
docker run -p 3000:3000 --env-file .env worldpay-webhooks
```

### Deploying to Caprover

1. Make sure you have the Caprover CLI installed:

   ```bash
   npm install -g caprover
   ```

2. Build and push the Docker image:

   ```bash
   # Log in to your Caprover server
   caprover login

   # Deploy the application (in the project directory)
   caprover deploy
   ```

3. Alternatively, you can set up automatic deployments in your Caprover dashboard:

   - Create a new app in your Caprover dashboard
   - Set up the application as "Has Dockerfile"
   - Connect your Git repository for automatic deployments
   - Configure environment variables in the Caprover dashboard

4. Important environment variables to set in Caprover:
   - `EMAIL_RECIPIENT`: Your email address
   - `SMTP_HOST`: SMTP server hostname
   - `SMTP_PORT`: SMTP server port
   - `SMTP_SECURE`: Whether to use secure connection (true/false)
   - `SMTP_USER`: SMTP username
   - `SMTP_PASS`: SMTP password

## Webhook Setup in Worldpay

1. Log into your Worldpay dashboard
2. Navigate to the Webhooks section
3. Enable the payment events you want to receive notifications for
4. Set your webhook URL to `https://your-caprover-app.yourdomain.com/webhook`
5. Ensure your server can receive HTTPS requests from Worldpay's IP addresses

## Security Notes

- In production, the application should run behind HTTPS
- The webhook endpoint only accepts requests from Worldpay's IP addresses (configurable in the application)
- For testing purposes, the IP validation can be disabled (uncomment the relevant section in the code)

## Worldpay Webhook Events

The application listens for the following payment events:

- `sentForAuthorization`: Payment sent for authorization
- `authorized`: Payment authorized
- `sentForSettlement`: Payment sent for settlement
- `cancelled`: Payment cancelled
- `error`: Payment error occurred
- `expired`: Payment expired
- `refused`: Payment refused
- `sentForRefund`: Payment sent for refund
- `refundFailed`: Payment refund failed
- `tokenCreated`: Payment token created

## Developer Notes

- The webhook endpoint responds with a 200 status code to acknowledge receipt of events (required by Worldpay)
- Worldpay will retry unacknowledged events at increasing intervals for up to one week
- Email notifications include the event type and all event details

## License

MIT
