import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async submit(slug: string, dto: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) throw new NotFoundException('Tenant not found')

    // Create VideoAsset if provided (uploaded via signed URL from StorageService)
    let videoId: string | undefined
    if (dto.videoS3Key) {
      const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${dto.videoS3Key}`
      const video = await this.prisma.videoAsset.create({ data: { tenantId: tenant.id, s3Key: dto.videoS3Key, url, sizeBytes: BigInt(dto.sizeBytes || 0), width: dto.width || null, height: dto.height || null, format: dto.format || 'webm' } })
      videoId = video.id
    }

    const review = await this.prisma.review.create({ data: {
      tenantId: tenant.id,
      title: dto.title,
      authorName: dto.authorName,
      authorEmail: dto.authorEmail,
      consent: !!dto.consent,
      videoId,
      status: 'PENDING',
      durationSec: dto.durationSec || null,
      previewUrl: dto.previewUrl || null,
    } })

    // Simple analytics
    await this.prisma.analyticsEvent.create({ data: { tenantId: tenant.id, type: 'REVIEW_SUBMITTED', meta: { reviewId: review.id } } })

    return { id: review.id, status: review.status }
  }

  moderate(id: string, action: 'APPROVE'|'REJECT'|'HIDE') {
    const status = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'HIDDEN'
    return this.prisma.review.update({ where: { id }, data: { status } })
  }

  async list(slug: string, status?: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) throw new NotFoundException('Tenant not found')
    return this.prisma.review.findMany({ where: { tenantId: tenant.id, ...(status ? { status: status as any } : {}) }, orderBy: { createdAt: 'desc' } })
  }
}