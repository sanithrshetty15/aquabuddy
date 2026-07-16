import { prisma } from '../config/database';
import { NotFoundError } from '../utils/error.utils';

type PrismaDelegate = {
  findUnique: (args: any) => any;
  findFirst: (args: any) => any;
  findMany: (args: any) => any;
  count: (args: any) => any;
  create: (args: any) => any;
  update: (args: any) => any;
  delete: (args: any) => any;
  updateMany: (args: any) => any;
};

export interface PaginationInput {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export abstract class BaseRepository<T, CreateInput, UpdateInput = Partial<CreateInput>> {
  protected abstract get delegate(): PrismaDelegate;
  protected abstract get modelName(): string;

  async findById(id: string, include?: Record<string, any>): Promise<T | null> {
    return this.delegate.findUnique({
      where: { id, deletedAt: null },
      include,
    });
  }

  async findFirst(where: Record<string, any>, include?: Record<string, any>): Promise<T | null> {
    return this.delegate.findFirst({
      where: { ...where, deletedAt: null },
      include,
    });
  }

  async findMany(where: Record<string, any> = {}, options: {
    include?: Record<string, any>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    skip?: number;
    take?: number;
  } = {}): Promise<T[]> {
    return this.delegate.findMany({
      where: { ...where, deletedAt: null },
      ...options,
    });
  }

  async findPaginated(
    where: Record<string, any> = {},
    pagination: PaginationInput,
    include?: Record<string, any>
  ): Promise<PaginatedResult<T>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.delegate.findMany({
        where: { ...where, deletedAt: null },
        include,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.delegate.count({ where: { ...where, deletedAt: null } }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async create(data: CreateInput): Promise<T> {
    return this.delegate.create({ data });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`${this.modelName} not found`);
    }
    return this.delegate.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`${this.modelName} not found`);
    }
    return this.delegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<T> {
    const existing = await this.delegate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`${this.modelName} not found`);
    }
    return this.delegate.delete({ where: { id } });
  }

  async count(where: Record<string, any> = {}): Promise<number> {
    return this.delegate.count({ where: { ...where, deletedAt: null } });
  }

  async exists(where: Record<string, any>): Promise<boolean> {
    const count = await this.delegate.count({ where: { ...where, deletedAt: null } });
    return count > 0;
  }
}
