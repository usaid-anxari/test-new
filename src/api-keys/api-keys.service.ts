import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async createApiKey(data: { tenantId: string; userId: string; keyHash: string }) {
    return this.prisma.apiKey.create({ data });
  }

  async findAll() {
    return this.prisma.apiKey.findMany();
  }

  async findOne(id: string) {
    return this.prisma.apiKey.findUnique({ where: { id } });
  }

  async remove(id: string) {
    return this.prisma.apiKey.delete({ where: { id } });
  }
}