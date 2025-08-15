import { Injectable } from '@nestjs/common'
import Stripe from 'stripe'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class BillingService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' })
  constructor(private prisma: PrismaService) {}

  async ensureCustomer(tenantId: string) {
    const acc = await this.prisma.billingAccount.findUnique({ where: { tenantId } })
    if (!acc) throw new Error('Billing account missing')
    if (acc.stripeCustomerId.startsWith('pending_')) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } })
      const customer = await this.stripe.customers.create({ name: tenant!.name, metadata: { tenantId } })
      await this.prisma.billingAccount.update({ where: { id: acc.id }, data: { stripeCustomerId: customer.id } })
      return customer.id
    }
    return acc.stripeCustomerId
  }

  async handlePaymentFailure(tenantId: string) {
    const now = new Date()
    const deleteAfter = new Date(now)
    deleteAfter.setMonth(deleteAfter.getMonth() + 12)
    await this.prisma.billingAccount.update({ where: { tenantId }, data: { state: 'UNPAID_HIDDEN', unpaidSince: now, deleteAfter } })
    await this.prisma.widget.updateMany({ where: { tenantId }, data: { isActive: false } })
  }

  async handlePaymentResolved(tenantId: string) {
    await this.prisma.billingAccount.update({ where: { tenantId }, data: { state: 'ACTIVE', unpaidSince: null, deleteAfter: null } })
    await this.prisma.widget.updateMany({ where: { tenantId }, data: { isActive: true } })
  }
}