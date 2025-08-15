export default () => ({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    priceIds: {
      free: process.env.STRIPE_PRICE_TIER_FREE!,
      starter: process.env.STRIPE_PRICE_TIER_STARTER!,
      pro: process.env.STRIPE_PRICE_TIER_PRO!,
    },
  },
})