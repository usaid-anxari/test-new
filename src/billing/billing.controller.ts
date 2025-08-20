import { Controller, Get, Param, Post } from '@nestjs/common'
import { BillingService } from './billing.service'

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Ensure Stripe customer exists or create one
  @Post('ensure-customer/:tenantId')
  async ensureCustomer(@Param('tenantId') tenantId: string) {
    return this.billingService.ensureCustomer(tenantId)
  }

  // Manually mark tenant as payment failed
  @Post('payment-failed/:tenantId')
  async markPaymentFailed(@Param('tenantId') tenantId: string) {
    await this.billingService.handlePaymentFailure(tenantId)
    return { message: 'Tenant marked as unpaid/hidden' }
  }

  // Manually mark tenant as payment resolved
  @Post('payment-resolved/:tenantId')
  async markPaymentResolved(@Param('tenantId') tenantId: string) {
    await this.billingService.handlePaymentResolved(tenantId)
    return { message: 'Tenant restored to active' }
  }
}
