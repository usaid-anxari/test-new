import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ShopifyService {
  constructor(private prisma: PrismaService) {}

//   async connectShopifyStore(tenantId: string, shopDomain: string, accessToken: string) {
//     try {
//       return await this.prisma.shopifyIntegration.create({
//         data: {
//           tenantId,
//           shopDomain,
//           accessToken,
//         },
//       });
//     } catch (error) {
//       throw new HttpException('Failed to connect Shopify store', HttpStatus.BAD_REQUEST);
//     }
//   }

//   async getShopifyIntegration(tenantId: string) {
//     return this.prisma.shopifyIntegration.findFirst({ where: { tenantId } });
//   }

//   async disconnectShopifyStore(id: string) {
//     return this.prisma.shopifyIntegration.delete({ where: { id } });
//   }
}