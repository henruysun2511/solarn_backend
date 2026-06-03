import { Module } from '@nestjs/common';

import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';
import { BlogRepository } from './repositories/blog.repository';

@Module({
  controllers: [BlogController],
  providers: [BlogService, BlogRepository]
})
export class BlogModule {}
