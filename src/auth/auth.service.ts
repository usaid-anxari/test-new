import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new UnauthorizedException('Email already in use')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const slug = dto.tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const tenant = await this.prisma.tenant.create({ data: { name: dto.tenantName, slug } })
    const user = await this.prisma.user.create({ data: { email: dto.email, passwordHash, name: dto.name } })

    await this.prisma.membership.create({ data: { role: 'OWNER', tenantId: tenant.id, userId: user.id } })

    // Create billing account placeholder
    await this.prisma.billingAccount.create({ data: { tenantId: tenant.id, stripeCustomerId: `pending_${tenant.id}` } })

    const token = await this.jwt.signAsync({ sub: user.id })
    return { token, user: { id: user.id, email: user.email }, tenant }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Invalid credentials')
    const token = await this.jwt.signAsync({ sub: user.id })
    return { token, user: { id: user.id, email: user.email } }
  }
}