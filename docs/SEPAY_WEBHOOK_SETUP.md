# SePay webhook setup

The backend accepts incoming SePay transfers at:

`POST /api/webhooks/sepay`

The endpoint expects SePay API Key authentication in the `Authorization: Apikey <key>` header. Configure the key as the Render environment variable `SEPAY_API_KEY`. Keep the key private and use the matching key for the selected SePay environment.

## Test safely

Never point a SePay Test Mode webhook at the production backend. A matching test transfer completes its matching order and updates revenue in the connected database. Use a separate staging backend connected to a separate staging database.

1. Deploy this branch to a staging backend and set `SEPAY_API_KEY` to the API key from SePay Test Mode.
2. In SePay Test Mode, create a webhook for incoming transfers. Set its URL to `https://<staging-backend>/api/webhooks/sepay`, choose API Key authentication, and enter the same Test Mode key.
3. Create a test order in staging and open its bank transfer QR in the staff dashboard.
4. In SePay Test Mode, simulate an incoming transfer using the exact order code shown in the QR transfer content and the exact QR amount.
5. The staff payment modal polls the receipt status and shows “Đã nhận được tiền chuyển khoản” after the callback is accepted. If no matching transfer arrives, it stays pending.

The backend accepts only incoming transfers. It matches an order code in the transfer content, requires an exact amount match, and stores the SePay transaction ID to make retries idempotent. The order and table are completed/released only after a valid callback. Staff can still use the manual confirmation button after checking the bank statement.

## Production

After the staging flow is verified, configure a separate Live webhook and Live API key on the production Render service. Do not use the Test Mode key or send simulated transfers to the production endpoint. SePay keeps Test Mode accounts, keys, webhooks, and transactions separate from Live.

SePay requires a successful webhook response to include HTTP 200/201 and JSON `{"success": true}`. Failed matches return `{"success": false}` so they appear as failures in SePay's webhook history and can be investigated.
