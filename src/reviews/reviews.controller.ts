import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  // Public endpoint for widget or public page
  @Post(':tenantSlug')
  submit(@Param('tenantSlug') slug: string, @Body() dto: any) {
    return this.svc.submit(slug, dto);
  }

  // Moderation endpoints (token/role validation can be added via guard in real app)
  @Patch(':id/moderate')
   moderate(
    @Param('id') id: string,
    @Body('action') action: 'APPROVE' | 'REJECT' | 'HIDE',
    @Body('type') type: 'MEDIA' | 'TEXT' = 'MEDIA',
  ) {
    return this.svc.moderate(id, action,type);
  }

  @Get(':tenantSlug/list')
  list(@Param('tenantSlug') slug: string, @Query('status') status?: string) {
    return this.svc.list(slug, status);
  }
}
