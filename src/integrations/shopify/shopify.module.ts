import { Module } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { ShopifyController } from './shopify.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ShopifyController],
  providers: [ShopifyService, PrismaService],
})
export class ShopifyModule {}