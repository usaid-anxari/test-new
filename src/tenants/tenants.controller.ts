import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { TenantsService } from './tenants.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private svc: TenantsService) {}

  @Get(':slug') getBySlug(@Param('slug') slug: string) { return this.svc.getBySlug(slug) }

  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body) }

  @Post(':id/api-keys') createApiKey(@Param('id') id: string) { return this.svc.createApiKey(id) }
}