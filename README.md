// TrueTestify Backend (NestJS + Prisma + Postgres + AWS S3)

## Setup (no Docker)

1) Environment variables (create `.env` in backend root):

Required:
- PORT=3000
- DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>?schema=public  (use AWS RDS endpoint)
- FRONTEND_URL=https://your-frontend.example.com (or http://localhost:5173)
- PUBLIC_API_BASE_URL=https://api.your-domain.com (or http://localhost:3000)
- JWT_SECRET=your_secret
- AWS_REGION=us-east-1
- AWS_S3_BUCKET=your-bucket
- AWS_ACCESS_KEY_ID=your-access-key
- AWS_SECRET_ACCESS_KEY=your-secret
- STRIPE_SECRET_KEY=sk_live_or_test
- STRIPE_WEBHOOK_SECRET=whsec_xxx
- STRIPE_PRICE_TIER_FREE=price_xxx
- STRIPE_PRICE_TIER_STARTER=price_xxx
- STRIPE_PRICE_TIER_PRO=price_xxx

2) Install dependencies
```
npm ci
```

3) Database migrate + seed
```
npx prisma migrate deploy
npx prisma db seed
```

4) Start API (dev)
```
npm run start:dev
```

5) Build and run (prod)
```
npm run build
npm run start:prod
```

Swagger is available at `/api-docs`.

## Application Flow (MVP)

- Collection: Client requests `POST /storage/upload-url` → uploads video to S3 with signed URL → submits review via `POST /reviews/:tenantSlug` with `consent=true`, `videoS3Key`, `durationSec` (<= 60).
- Moderation: Admin approves/rejects/hides via `PATCH /reviews/:id/moderate` (MEDIA or TEXT). Approved items appear in feeds.
- Embed: Sites include `<script src="${PUBLIC_API_BASE_URL}/embed/script/:tenantSlug.js" data-truetestify data-layout="GRID"></script>`. The script injects an iframe that pulls `GET /embed/:tenantSlug/view?layout=...` and renders. Feed data also available at `GET /widgets/:tenantSlug`.
- Analytics: Each embed view logs `WIDGET_VIEW`; submissions log `REVIEW_SUBMITTED`.
- Billing: Stripe webhooks set tenant state to hide widgets on failed payments; daily cron cleans up after 12 months unpaid.

## Testing with Postman

Base URL: `http://localhost:3000`

### Step 1: Create API Key for WordPress Integration
POST `/api-keys`
Body (JSON):
```json
{
  "tenantId": "demo-co-tenant-id",
  "userId": "demo-user-id"
}
```
**Note:** To get the tenant ID, check the database or use the seed data. The demo tenant ID is created by the seed script.

Response: `{ id, apiKey: "tt_xxxxxxxxx", tenantId }` - **Save this apiKey!**

### Step 2: Test WordPress API Key Verification
POST `/integrations/wordpress/verify-api-key`
Body (JSON):
```json
{
  "tenantSlug": "demo-co",
  "apiKey": "tt_xxxxxxxxx"  // Use the apiKey from Step 1
}
```
Expected: `{ ok: true }` if valid, `401 Unauthorized` if invalid.

### Step 3: Create a Test Review (Text Only)
POST `/reviews/demo-co`
Body (JSON):
```json
{
  "title": "Amazing Product!",
  "authorName": "John Doe",
  "authorEmail": "john@example.com",
  "consent": true,
  "text": "This product exceeded my expectations. Highly recommended!",
  "durationSec": 0
}
```
Response: `{ id: "review-id", status: "PENDING" }`

### Step 4: Approve the Review
PATCH `/reviews/review-id/moderate`
Body (JSON):
```json
{
  "action": "APPROVE",
  "type": "TEXT"
}
```

### Step 5: Test Widget Feed
GET `/widgets/demo-co?layout=GRID`
Expected: JSON with approved reviews.

### Step 6: Test Embed Script
GET `/embed/script/demo-co.js`
Expected: JavaScript code that injects iframe.

### Step 7: Test Embed View (This should now show content!)
GET `/embed/demo-co/view?layout=GRID`
Expected: HTML page with testimonials displayed.

### Step 8: Test with Video Review (Optional)
1. Get S3 upload URL:
POST `/storage/upload-url`
Body (JSON):
```json
{
  "tenantSlug": "demo-co",
  "contentType": "video/webm"
}
```
Response: `{ key: "demo-co/videos/xxx.webm", url: "https://..." }`

2. Upload video to the returned URL (PUT request with video file)

3. Submit review with video:
POST `/reviews/demo-co`
Body (JSON):
```json
{
  "title": "Video Review",
  "authorName": "Jane Smith",
  "consent": true,
  "videoS3Key": "demo-co/videos/xxx.webm",
  "durationSec": 30
}
```

4. Approve video review:
PATCH `/reviews/review-id/moderate`
Body (JSON):
```json
{
  "action": "APPROVE",
  "type": "MEDIA"
}
```

### Step 9: Test Different Layouts
- `GET /embed/demo-co/view?layout=CAROUSEL`
- `GET /embed/demo-co/view?layout=SPOTLIGHT`
- `GET /embed/demo-co/view?layout=WALL`
- `GET /embed/demo-co/view?layout=FLOATING_BUBBLE`

### Step 10: Shopify Integration
POST `/integrations/shopify/connect`
Body (JSON):
```json
{
  "tenantId": "demo-co-tenant-id",
  "shopDomain": "mystore.myshopify.com",
  "accessToken": "shpat_xxxxxxxxx"
}
```

GET `/integrations/shopify/demo-co-tenant-id`
DELETE `/integrations/shopify/integration-id`

---

// Endpoints quick list (reference)
# Auth
POST /auth/register { email, password, name?, tenantName }
POST /auth/login { email, password }

# Tenants
GET /tenants/:slug
PATCH /tenants/:id { name, logoUrl, brandPrimaryHex, brandAccentHex }
POST /tenants/:id/api-keys  -> returns { apiKey }

# Storage
POST /storage/upload-url { tenantSlug, contentType } -> { key, url }

# Reviews (public)
POST /reviews/:tenantSlug { title?, authorName?, authorEmail?, consent: true, videoS3Key?, sizeBytes?, durationSec?, previewUrl? }
PATCH /reviews/:id/moderate { action: APPROVE|REJECT|HIDE }
GET /reviews/:tenantSlug/list?status=APPROVED

# Widgets (public feed for <script> or <iframe>)
GET /widgets/:tenantSlug?layout=GRID|CAROUSEL|SPOTLIGHT|FLOATING_BUBBLE

# Embeds
GET /embed/script/:tenantSlug.js
GET /embed/:tenantSlug/view?layout=GRID|CAROUSEL|SPOTLIGHT|WALL|FLOATING_BUBBLE

# Analytics
POST /analytics { tenantId, type, meta? }

# Billing / Stripe Webhooks
POST /webhooks/stripe  (set endpoint secret)

# Tasks (CRON)
- Auto-hide widgets on payment_failed (webhook)
- Auto-delete reviews/videos after 12 months unpaid (daily cron)

# Notes
- Client must compress to 720p before uploading. Server trusts provided metadata.
- Consent checkbox must be enforced client-side and stored here (Review.consent=true).
- WordPress and Shopify integrations validate via API key or OAuth, then read /widgets feed.


<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
