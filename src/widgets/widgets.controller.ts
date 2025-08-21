import { Controller, Get, Param, Query } from '@nestjs/common'
import { WidgetsService } from './widgets.service'

@Controller('widgets')
export class WidgetsController {
  constructor(private svc: WidgetsService) {}

  @Get(':tenantSlug')
  feed(
    @Param('tenantSlug') slug: string,
    @Query('layout') layout?: 'GRID' | 'CAROUSEL' | 'SPOTLIGHT' | 'WALL' | 'FLOATING_BUBBLE',
  ) {
    return this.svc.widgetFeed(slug, layout)
  }
}
