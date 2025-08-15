import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(billingAccountId: string, amountCents: number, stripeInvoiceId: string) {
    return this.prisma.invoice.create({ data: { billingAccountId, amountDueCents: amountCents, stripeInvoiceId, status: 'open' } })
  }
}