import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async track(e: { tenantId: string; type: string; meta?: any }) {
    return this.prisma.analyticsEvent.create({
      data: {
        tenantId: e.tenantId,
        type: e.type,
        meta: e.meta ?? {}, // fallback to empty JSON instead of undefined
      },
    })
  }
}
