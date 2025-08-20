import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { InvoicesService } from './invoices.service'
import { UsageService } from './usage.service'
import { StripeWebhookController } from './stripe.webhook.controller'
import { BillingController } from './billing.controller'
import { InvoicesController } from './invoices.controller'
import { UsageController } from './usage.controller'

@Module({
  providers: [BillingService, InvoicesService, UsageService],
  controllers: [
    StripeWebhookController,
    BillingController,
    InvoicesController,
    UsageController,
  ],
  exports: [BillingService, UsageService],
})
export class BillingModule {}
