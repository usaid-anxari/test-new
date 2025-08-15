import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/api-key.dto';
import * as crypto from 'crypto';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async createApiKey(@Body() body: CreateApiKeyDto) {
    // Hash the API key securely
    const keyHash = crypto.createHash('sha256').update(body.key).digest('hex');

    // Use provided userId or fallback
    const userId = body.userId ?? 'default-user-id';

    return this.apiKeysService.createApiKey({
      ...body,
      keyHash,
      userId,
    });
  }

  @Get()
  findAll() {
    return this.apiKeysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiKeysService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiKeysService.remove(id);
  }
}
