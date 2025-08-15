import { Body, Controller, Headers, Post } from '@nestjs/common'
import Stripe from 'stripe'
import { BillingService } from './billing.service'
import { PrismaService } from '../../prisma/prisma.service'

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' })
  constructor(private billing: BillingService, private prisma: PrismaService) {}

  @Post()
  async handle(@Body() body: any, @Headers('stripe-signature') sig: string) {
    const event = this.stripe.webhooks.constructEvent(JSON.stringify(body), sig, process.env.STRIPE_WEBHOOK_SECRET!)
    switch (event.type) {
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        const tenantId = inv.metadata?.tenantId
        if (tenantId) await this.billing.handlePaymentFailure(tenantId)
        break
      }
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice
        const tenantId = inv.metadata?.tenantId
        if (tenantId) await this.billing.handlePaymentResolved(tenantId)
        break
      }
    }
    return { received: true }
  }
}