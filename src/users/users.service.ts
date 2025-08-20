import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          name: data.name,
        },
      });

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `User with email "${data.email}" already exists`,
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: {
        memberships: {
          include: {
            tenant: true,
          },
        },
      },
    });
    if (!user) return null;
    const { passwordHash, ...result } = user;

    return result;
  }
}
