import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class AudioAssetsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: any) {
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${dto.s3Key}`

    return this.prisma.audioAsset.upsert({
      where: { s3Key: dto.s3Key },
      update: {},
      create: {
        tenantId,
        s3Key: dto.s3Key,
        url,
        sizeBytes: BigInt(dto.sizeBytes || 0),
        format: dto.format || 'webm',
      },
    })
  }
}
