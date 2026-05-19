import { Controller, Get } from '@nestjs/common';
import { Public, ResponseMessage } from 'common/decorators';

import { TeacherService } from '../services/teacher.service';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách giảng viên thành công')
  async findAll() {
    return this.teacherService.findTeachersForSalary();
  }
}
