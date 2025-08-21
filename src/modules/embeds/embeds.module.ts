import { Module } from '@nestjs/common'
import { EmbedsController } from './embeds.controller'
import { PrismaModule } from '../../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EmbedsController],
})
export class EmbedsModule {}



