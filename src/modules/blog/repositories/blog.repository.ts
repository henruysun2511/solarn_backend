import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { BlogSearchDto, CreateBlogDto } from '../dtos';
import { UpdateBlogDto } from '../dtos/update-blog.dto';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: BlogSearchDto): Prisma.BlogWhereInput {
    const { search } = query;
    return {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(query.isPublished !== undefined && { isPublished: query.isPublished })
    };
  }

  async findMany(query: BlogSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);
    return this.prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    });
  }

  async count(query: BlogSearchDto) {
    return this.prisma.blog.count({ where: this.buildWhere(query) });
  }

  async findById(blogId: string) {
    return this.prisma.blog.findUnique({ where: { blogId } });
  }

  async findBySlug(slug: string) {
    return this.prisma.blog.findFirst({ where: { slug, isPublished: true } });
  }

  async create(data: CreateBlogDto) {
    return this.prisma.blog.create({ data });
  }

  async update(blogId: string, data: UpdateBlogDto) {
    return this.prisma.blog.update({ where: { blogId }, data });
  }

  async delete(blogId: string) {
    return this.prisma.blog.delete({ where: { blogId } });
  }
}
