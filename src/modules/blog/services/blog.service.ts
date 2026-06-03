import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { BlogSearchDto, CreateBlogDto } from '../dtos';
import { UpdateBlogDto } from '../dtos/update-blog.dto';
import { BlogRepository } from '../repositories/blog.repository';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepo: BlogRepository) {}

  async create(dto: CreateBlogDto) {
    return this.blogRepo.create(dto);
  }

  async findAll(query: BlogSearchDto) {
    const [data, total] = await Promise.all([this.blogRepo.findMany(query), this.blogRepo.count(query)]);
    return paginate(data, total, query);
  }

  async findById(blogId: string) {
    const blog = await this.blogRepo.findById(blogId);
    if (!blog) throw new NotFoundException('Bài viết không tồn tại');
    return blog;
  }

  async findBySlug(slug: string) {
    const blog = await this.blogRepo.findBySlug(slug);
    if (!blog) throw new NotFoundException('Bài viết không tồn tại');
    return blog;
  }

  async update(blogId: string, dto: UpdateBlogDto) {
    await this.findById(blogId);
    return this.blogRepo.update(blogId, dto);
  }

  async delete(blogId: string) {
    await this.findById(blogId);
    return this.blogRepo.delete(blogId);
  }
}
