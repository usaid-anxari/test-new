import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { InvoicesService } from './invoices.service'
import { UsageService } from './usage.service'
import { StripeWebhookController } from './stripe.webhook.controller'
@Module({ providers: [BillingService, InvoicesService, UsageService], controllers: [StripeWebhookController], exports: [BillingService, UsageService] })
export class BillingModule {}