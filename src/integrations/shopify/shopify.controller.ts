import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller('integrations/shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Post('connect')
  connect(@Body() body: { tenantId: string; shopDomain: string; accessToken: string }) {
    return "hello World: Connect"
    //  return this.shopifyService.connectShopifyStore(body.tenantId, body.shopDomain, body.accessToken);
  }

  @Get(':tenantId')
  getIntegration(@Param('tenantId') tenantId: string) {
    return "hello World: tenantId" 
    // return this.shopifyService.getShopifyIntegration(tenantId);
  }

  @Delete(':id')
  disconnect(@Param('id') id: string) {
    return "hello World: Delete"
    // return this.shopifyService.disconnectShopifyStore(id);
  }
}