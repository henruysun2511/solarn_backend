import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';

import { BlogSearchDto, CreateBlogDto } from '../dtos';
import { UpdateBlogDto } from '../dtos/update-blog.dto';
import { BlogSortBy } from '../enums/blog-sort-by.enum';
import { BlogService } from '../services/blog.service';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @SwaggerDoc({
    summary: 'Get All Blogs',
    description: 'Retrieve blogs with pagination, sorting, search.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by title or excerpt' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean, description: 'Filter by published status' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder, example: SortOrder.DESC })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(BlogSortBy) })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách bài viết thành công')
  async findAll(@Query() query: BlogSearchDto) {
    return this.blogService.findAll(query);
  }

  @SwaggerDoc({ summary: 'Get Blog by Slug (public)', status: 200 })
  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Lấy bài viết thành công')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @SwaggerDoc({ summary: 'Get Blog by ID', status: 200 })
  @ApiBearerAuth()
  @Get(':blogId')
  @ResponseMessage('Lấy bài viết thành công')
  async findById(@Param('blogId') blogId: string) {
    return this.blogService.findById(blogId);
  }

  @SwaggerDoc({ summary: 'Create Blog', bodyType: CreateBlogDto, status: 201 })
  @ApiBearerAuth()
  @Post()
  @ResponseMessage('Thêm bài viết thành công')
  async create(@Body() dto: CreateBlogDto) {
    return this.blogService.create(dto);
  }

  @SwaggerDoc({ summary: 'Update Blog', bodyType: UpdateBlogDto, status: 200 })
  @ApiBearerAuth()
  @Put(':blogId')
  @ResponseMessage('Cập nhật bài viết thành công')
  async update(@Param('blogId') blogId: string, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(blogId, dto);
  }

  @SwaggerDoc({ summary: 'Delete Blog', status: 200 })
  @ApiBearerAuth()
  @Delete(':blogId')
  @ResponseMessage('Xóa bài viết thành công')
  async delete(@Param('blogId') blogId: string) {
    return this.blogService.delete(blogId);
  }
}
