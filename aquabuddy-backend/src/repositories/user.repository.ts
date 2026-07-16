import { PrismaClient } from '@prisma/client';
import prisma from '../config/database';
import { BaseRepository } from './base.repository';

type UserDelegate = typeof prisma.user;

const createUserInput = (data: any) => ({
  email: data.email,
  password: data.password,
  firstName: data.firstName,
  lastName: data.lastName,
  phone: data.phone,
  country: data.country,
  city: data.city,
  timezone: data.timezone,
  role: data.role,
  status: data.status ?? 'ACTIVE',
});

export class UserRepository extends BaseRepository<any, ReturnType<typeof createUserInput>> {
  protected delegate = prisma.user as any;
  protected modelName = 'User';

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async findBySupabaseId(supabaseUserId: string) {
    return prisma.user.findFirst({ where: { supabaseUserId, deletedAt: null } });
  }

  async updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  }
}

export const userRepository = new UserRepository();
