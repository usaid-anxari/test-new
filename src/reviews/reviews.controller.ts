import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ReviewsService } from './reviews.service'

@Controller('reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  // Public endpoint for widget or public page
  @Post(':tenantSlug')
  submit(@Param('tenantSlug') slug: string, @Body() dto: any) { return this.svc.submit(slug, dto) }

  // Moderation endpoints (token/role validation can be added via guard in real app)
  @Patch(':id/moderate')
  moderate(@Param('id') id: string, @Body() body: { action: 'APPROVE'|'REJECT'|'HIDE' }) {
    return this.svc.moderate(id, body.action)
  }

  @Get(':tenantSlug/list')
  list(@Param('tenantSlug') slug: string, @Query('status') status?: string) { return this.svc.list(slug, status) }
}