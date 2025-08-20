import { Body, Controller, Post } from '@nestjs/common'
import { InvoicesService } from './invoices.service'

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async createInvoice(
    @Body() body: { billingAccountId: string; amountCents: number; stripeInvoiceId: string }
  ) {
    return this.invoicesService.createInvoice(
      body.billingAccountId,
      body.amountCents,
      body.stripeInvoiceId
    )
  }
}
