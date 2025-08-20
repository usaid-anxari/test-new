import { Controller, Get, Param } from '@nestjs/common'
import { UsageService } from './usage.service'

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get(':tenantId')
  async snapshotUsage(@Param('tenantId') tenantId: string) {
    return this.usageService.snapshotUsage(tenantId)
  }
}
