import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { ClassService } from '../services/class.service';
import { CreateClassDto } from '../dtos';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @SwaggerDoc({
    summary: 'Create Class',
    bodyType: CreateClassDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo lớp thành công')
  async create(@Body() dto: CreateClassDto) {
    return this.classService.create(dto);
  }
}
