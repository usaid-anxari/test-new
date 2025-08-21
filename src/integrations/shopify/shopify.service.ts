import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ShopifyService {
  constructor(private prisma: PrismaService) {}

  async connectShopifyStore(tenantId: string, shopDomain: string, accessToken: string) {
    try {
      return await this.prisma.integration.upsert({
        where: { id: `${tenantId}:${shopDomain}:SHOPIFY` },
        update: { accessToken },
        create: {
          id: `${tenantId}:${shopDomain}:SHOPIFY`,
          tenantId,
          kind: 'SHOPIFY',
          shopDomain,
          accessToken,
        },
      });
    } catch (error) {
      throw new HttpException('Failed to connect Shopify store', HttpStatus.BAD_REQUEST);
    }
  }

  async getShopifyIntegration(tenantId: string) {
    return this.prisma.integration.findFirst({ where: { tenantId, kind: 'SHOPIFY' } });
  }

  async disconnectShopifyStore(id: string) {
    return this.prisma.integration.delete({ where: { id } });
  }
}