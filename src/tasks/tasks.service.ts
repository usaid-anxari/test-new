import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class TasksService {
  private log = new Logger(TasksService.name)
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanupUnpaid() {
    const now = new Date()
    const toDelete = await this.prisma.billingAccount.findMany({ where: { state: 'UNPAID_HIDDEN', deleteAfter: { lte: now } } })
    for (const acc of toDelete) {
      this.log.warn(`Deleting tenant data due to 12 months unpaid: ${acc.tenantId}`)
      // Soft delete: mark reviews/videos removed (hard delete left as exercise)
      await this.prisma.review.deleteMany({ where: { tenantId: acc.tenantId } })
      await this.prisma.videoAsset.deleteMany({ where: { tenantId: acc.tenantId } })
      await this.prisma.billingAccount.update({ where: { id: acc.id }, data: { state: 'DELETED' } })
    }
  }
}