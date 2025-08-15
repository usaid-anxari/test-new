import { Body, Controller, Post } from '@nestjs/common'
import { WordpressService } from './wordpress.service'

@Controller('integrations/wordpress')
export class WordpressController {
  constructor(private svc: WordpressService) {}

  @Post('verify-api-key')
  verify(@Body() body: { tenantSlug: string, apiKey: string }) { return this.svc.verifyApiKey(body) }
}