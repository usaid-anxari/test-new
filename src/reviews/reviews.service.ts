import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VideoAssetsService } from './media/video-assets.service';
import { AudioAssetsService } from './media/audio-assets.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private videoAssets: VideoAssetsService,
    private audioAssets: AudioAssetsService,
  ) {}

  async submit(slug: string, dto: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Enforce consent and 60-second limit per MVP
    if (!dto.consent) {
      throw new BadRequestException('Consent is required to submit a review');
    }
    if (dto.durationSec && Number(dto.durationSec) > 60) {
      throw new BadRequestException('Maximum allowed duration is 60 seconds');
    }

    let videoId: string | undefined;
    if (dto.videoS3Key) {
      const video = await this.videoAssets.create(tenant.id, {
        ...dto,
        s3Key: dto.videoS3Key,
      });
      videoId = video.id;
    }

    let audioId: string | undefined;
    if (dto.audioS3Key) {
      const audio = await this.audioAssets.create(tenant.id, {
        ...dto,
        s3Key: dto.audioS3Key,
      });
      audioId = audio.id;
    }
    let text = dto.text || null;
    let textStatus = 'PENDING';
    if (text) {
      if (!tenant.allowTextReviews) {
        // text allowed but only after admin approval
        textStatus = 'PENDING';
      } else {
        // text reviews auto-approved if tenant allows
        textStatus = 'APPROVED';
      }
    }
    const review = await this.prisma.review.create({
      data: {
        tenantId: tenant.id,
        title: dto.title,
        authorName: dto.authorName,
        authorEmail: dto.authorEmail,
        consent: !!dto.consent,
        videoId,
        audioId,
        text,
        textStatus,
        status: 'PENDING',
        durationSec: dto.durationSec || null,
        previewUrl: dto.previewUrl || null,
      },
    });

    await this.prisma.analyticsEvent.create({
      data: {
        tenantId: tenant.id,
        type: 'REVIEW_SUBMITTED',
        meta: { reviewId: review.id },
      },
    });

    return { id: review.id, status: review.status };
  }

  // async submit(slug: string, dto: any) {
  //   const tenant = await this.prisma.tenant.findUnique({ where: { slug } })
  //   if (!tenant) throw new NotFoundException('Tenant not found')

  //   // Create VideoAsset if provided (uploaded via signed URL from StorageService)
  //   let videoId: string | undefined
  //   if (dto.videoS3Key) {
  //     const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${dto.videoS3Key}`
  //     const video = await this.prisma.videoAsset.create({ data: { tenantId: tenant.id, s3Key: dto.videoS3Key, url, sizeBytes: BigInt(dto.sizeBytes || 0), width: dto.width || null, height: dto.height || null, format: dto.format || 'webm' } })
  //     videoId = video.id
  //   }
  //   let audioId: string | undefined
  //   if (dto.audioS3Key) {
  //     const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${dto.audioS3Key}`
  //     const audio = await this.prisma.videoAsset.create({ data: { tenantId: tenant.id, s3Key: dto.audioS3Key, url, sizeBytes: BigInt(dto.sizeBytes || 0), width: dto.width || null, height: dto.height || null, format: dto.format || 'webm' } })
  //     audioId = audio.id
  //   }
  //   const review = await this.prisma.review.create({ data: {
  //     tenantId: tenant.id,
  //     title: dto.title,
  //     authorName: dto.authorName,
  //     authorEmail: dto.authorEmail,
  //     consent: !!dto.consent,
  //     videoId,
  //     audioId,
  //     status: 'PENDING',
  //     durationSec: dto.durationSec || null,
  //     previewUrl: dto.previewUrl || null,
  //   } })

  //   // Simple analytics
  //   await this.prisma.analyticsEvent.create({ data: { tenantId: tenant.id, type: 'REVIEW_SUBMITTED', meta: { reviewId: review.id } } })

  //   return { id: review.id, status: review.status }
  // }

  // moderate(id: string, action: 'APPROVE'|'REJECT'|'HIDE') {
  //   const status = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'HIDDEN'
  //   return this.prisma.review.update({ where: { id }, data: { status } })
  // }
  async moderate(
  id: string,
  action: 'APPROVE' | 'REJECT' | 'HIDE',
  type: 'MEDIA' | 'TEXT' = 'MEDIA',
) {
  const status =
    action === 'APPROVE'
      ? 'APPROVED'
      : action === 'REJECT'
      ? 'REJECTED'
      : 'HIDDEN';

  if (type === 'TEXT') {
    console.log('Updating TEXT status:', id, status);
    return this.prisma.review.update({
      where: { id },
      data: { textStatus: status },
    });
  }

  return this.prisma.review.update({
    where: { id },
    data: { status },
  });
}

  async list(slug: string, status?: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return this.prisma.review.findMany({
      where: {
        tenantId: tenant.id,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
