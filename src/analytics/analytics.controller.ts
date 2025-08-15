import { Body, Controller, Post } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'

@Controller('analytics')
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}
  @Post() track(@Body() body: { tenantId: string, type: string, meta?: any }) { return this.svc.track(body) }
}