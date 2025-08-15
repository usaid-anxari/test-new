import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { randomBytes, createHash } from 'crypto'

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  getBySlug(slug: string) { return this.prisma.tenant.findUnique({ where: { slug } }) }

  update(id: string, data: any) { return this.prisma.tenant.update({ where: { id }, data }) }

  async createApiKey(tenantId: string) {
    const raw = `tt_${randomBytes(24).toString('hex')}`
    const keyHash = createHash('sha256').update(raw).digest('hex')
    await this.prisma.apiKey.create({ data: { tenantId, userId: 'someUserId', keyHash, label: 'Default' } })
    return { apiKey: raw }
  }
}