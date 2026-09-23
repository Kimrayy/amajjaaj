# PlayMart

Original Indonesian game top-up storefront, using modern checkout patterns inspired by top-up marketplaces such as Takapedia.

Included: responsive storefront, game search and filters, checkout modal, invoice tracking, budget calculator, article section, mobile drawer navigation, and environment-driven provider configuration.

Deployment: Railway can run this repository with `npm start`. For live fulfillment and payments, configure `TOPUP_API_BASE_URL` + `TOPUP_API_KEY` and `PAYMENT_API_BASE_URL` + `PAYMENT_API_KEY`. Keep secrets in Railway variables, never in GitHub.

`DEMO_MODE=true` is safe for initial UI testing. Orders are stored in memory in demo mode, so a persistent database should be added before real production order history is required.
