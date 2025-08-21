import { Body, Controller, Post } from '@nestjs/common'
import { StorageService } from './storage.service'

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload-url')
  createUploadUrl(
    @Body()
    body: {
      tenantSlug: string
      contentType: string
    },
  ) {
    return this.storage.createUploadUrl(body.tenantSlug, { contentType: body.contentType })
  }
}



