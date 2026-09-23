# PlayMart

PlayMart is an original Indonesian game top-up storefront with a modern marketplace-style UX.

## Included

- Responsive storefront and mobile drawer
- Game catalog, categories, search, articles and budget calculator
- Checkout + invoice tracking
- Production-ready server adapter for a payment API
- Production-ready server adapter for a top-up/fulfillment API
- Payment webhook endpoint that can trigger fulfillment after payment success
- Optional Supabase REST persistence
- Railway health endpoint at `/health`
- All secrets are read from server-side environment variables

## Railway

The repository is connected to the Railway project `joyful-enchantment`, service `amajjaaj`, production environment.

Railway detected Node 20 and the deployment is currently healthy. Railway variables are the correct place for secrets; do not commit real API keys to GitHub. Railway makes service variables available to the running app as environment variables. See the official Railway documentation for variables. 

### Required for demo

```
DEMO_MODE=true
SUPPORT_WHATSAPP=628xxxxxxxxxx
```

### Required for real transactions

Set:

```
DEMO_MODE=false

TOPUP_API_BASE_URL=https://YOUR-TOPUP-PROVIDER.example
TOPUP_API_KEY=YOUR_REAL_SECRET
TOPUP_ORDER_PATH=/orders

PAYMENT_API_BASE_URL=https://YOUR-PAYMENT-PROVIDER.example
PAYMENT_API_KEY=YOUR_REAL_SECRET
PAYMENT_CREATE_PATH=/payments

WEBHOOK_SECRET=YOUR_RANDOM_SECRET
```

The exact provider URLs, authentication rules and request fields vary by provider. The adapter sends both `Authorization: Bearer` and `x-api-key`; if your provider uses a different contract, its adapter should be adjusted rather than guessing.

### Persistent orders

For production history, configure Supabase:

```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_KEY
```

Use the SQL in `supabase/schema.sql` to create the orders table.

## API routes

- `GET /health`
- `GET /api/config`
- `GET /api/products`
- `GET /api/articles`
- `POST /api/orders`
- `GET /api/orders/:invoice`
- `POST /api/webhooks/payment`

## Important

No real API key is fabricated or stored in the repository. The project is wired so you only need to paste credentials from the providers you actually choose into Railway Variables. After changing variables, deploy the staged changes in Railway.
