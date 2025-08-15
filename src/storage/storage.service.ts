import { Injectable } from '@nestjs/common'
import { S3 } from 'aws-sdk'
import { v4 as uuid } from 'uuid'

@Injectable()
export class StorageService {
  private s3 = new S3({ region: process.env.AWS_REGION })

  createUploadUrl(tenantSlug: string, opts: { contentType: string }) {
    const key = `${tenantSlug}/videos/${uuid()}.webm` // client compresses to 720p webm/mp4
    const url = this.s3.getSignedUrl('putObject', {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Expires: 60 * 5,
      ContentType: opts.contentType,
      ACL: 'public-read',
    })
    return { key, url }
  }

  getPublicUrl(key: string) {
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  }
}