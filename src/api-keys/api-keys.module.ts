import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ApiKeysController],
  providers: [ApiKeysService, PrismaService],
})
export class ApiKeysModule {}