import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async snapshotUsage(tenantId: string) {
    const [videos, widgetViews, reviewsCount] = await Promise.all([
      this.prisma.videoAsset.findMany({ where: { tenantId } }),
      this.prisma.analyticsEvent.count({ where: { tenantId, type: 'WIDGET_VIEW' } }),
      this.prisma.review.count({ where: { tenantId } }),
    ])
    const storageBytes = videos.reduce((acc, v) => acc + Number(v.sizeBytes || 0), 0)
    return { storageBytes, widgetViews, reviewsCount }
  }
}