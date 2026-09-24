# PlayMart

PlayMart is an original Indonesian game top-up marketplace demo rebuilt with **Next.js + React + Tailwind CSS**.

## Frontend

- Next.js App Router
- React client components
- Tailwind CSS v4 via the official PostCSS integration
- Responsive desktop/mobile navigation
- Product catalog and filters
- Product detail + 6-step checkout
- Preview payment modal
- Demo invoice tracking
- Demo account login/register
- Leaderboard, reviews, articles and Magic Wheel calculator

## Demo user

Use this account on the sign-in page:

```
Username: demo
Password: demo123
```

Registration also works while `DEMO_MODE=true`.

## Backend

The existing Express API remains behind the Next.js custom server so the current API contract is preserved.

- `GET /health`
- `GET /api/config`
- `GET /api/products`
- `GET /api/articles`
- `GET /api/orders/:invoice`
- `POST /api/orders`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/webhooks/payment`

## Railway

The production service uses:

```
Build: npm run build
Start: npm start
Healthcheck: /health
```

Keep real provider keys only in Railway Variables. `DEMO_MODE=true` is the intended current demo configuration.

## Production integrations

When moving to production, configure the actual provider credentials and contracts in Railway:

```
DEMO_MODE=false

TOPUP_API_BASE_URL=
TOPUP_API_KEY=
TOPUP_ORDER_PATH=/orders

PAYMENT_API_BASE_URL=
PAYMENT_API_KEY=
PAYMENT_CREATE_PATH=/payments

WEBHOOK_SECRET=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Provider request fields and authentication vary by provider; the adapter should be mapped to the selected provider instead of guessing.

## Database

`supabase/schema.sql` contains the optional production `orders` table definition. The current demo does not require a Supabase connection.

## UI direction

The UI follows the same broad marketplace information architecture as modern top-up storefronts: persistent navigation, product catalog, detailed product checkout, payment preview and invoice tracking, while using original visuals and implementation.
