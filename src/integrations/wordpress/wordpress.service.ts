import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { createHash } from 'crypto'

@Injectable()
export class WordpressService {
  constructor(private prisma: PrismaService) {}
  async verifyApiKey({ tenantSlug, apiKey }: { tenantSlug: string; apiKey: string }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) throw new UnauthorizedException()
    const keyHash = createHash('sha256').update(apiKey).digest('hex')
    const match = await this.prisma.apiKey.findFirst({ where: { tenantId: tenant.id, keyHash } })
    if (!match) throw new UnauthorizedException()
    return { ok: true }
  }
}