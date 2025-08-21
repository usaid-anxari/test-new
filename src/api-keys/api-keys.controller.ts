import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/api-key.dto';
import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async createApiKey(@Body() body: CreateApiKeyDto) {
    // Generate a new API key if not provided
    const apiKey = body.key || `tt_${uuid().replace(/-/g, '')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const userId = body.userId ?? 'default-user-id';

    const result = await this.apiKeysService.createApiKey({
      tenantId: body.tenantId,
      keyHash,
      userId,
    });

    return { 
      id: result.id, 
      apiKey, // Return the plain API key only once
      tenantId: result.tenantId 
    };
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
