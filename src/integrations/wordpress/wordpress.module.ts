import { Module } from '@nestjs/common';
import { WordpressService } from './wordpress.service';
import { WordpressController } from './wordpress.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [WordpressController],
  providers: [WordpressService, PrismaService],
})
export class WordpressModule {}