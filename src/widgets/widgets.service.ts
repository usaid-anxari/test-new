import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class WidgetsService {
  constructor(private prisma: PrismaService) {}

  async widgetFeed(slug: string, layout?: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) throw new NotFoundException('Tenant not found')

    const reviews = await this.prisma.review.findMany({
      where: { tenantId: tenant.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { video: true },
    })
    return {
      tenant: { name: tenant.name, logoUrl: tenant.logoUrl, brandPrimaryHex: tenant.brandPrimaryHex, brandAccentHex: tenant.brandAccentHex },
      layout: layout || 'GRID',
      items: reviews.map(r => ({ id: r.id, title: r.title, authorName: r.authorName, videoUrl: r.video?.url, previewUrl: r.previewUrl, durationSec: r.durationSec })),
    }
  }
}