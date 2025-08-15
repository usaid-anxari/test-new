import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main() {
  const tenant = await prisma.tenant.create({ data: { name: 'Demo Co', slug: 'demo-co', brandPrimaryHex: '#1e3a8a', brandAccentHex: '#f97316' } })
  const user = await prisma.user.create({ data: { email: 'owner@demo.co', passwordHash: await bcrypt.hash('password123', 10), name: 'Owner' } })
  await prisma.membership.create({ data: { tenantId: tenant.id, userId: user.id, role: 'OWNER' } })
  await prisma.billingAccount.create({ data: { tenantId: tenant.id, stripeCustomerId: `pending_${tenant.id}` } })
}
main().finally(() => prisma.$disconnect())