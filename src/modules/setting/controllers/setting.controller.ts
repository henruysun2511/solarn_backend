import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { UpdateSettingDto } from '../dtos/update-setting.dto';
import { SettingService } from '../services/setting.service';

@Controller('settings')
@ApiBearerAuth()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @SwaggerDoc({ summary: 'Get System Settings', status: 200 })
  @Public()
  @Get()
  @ResponseMessage('Lấy cài đặt hệ thống thành công')
  async get() {
    return this.settingService.get();
  }

  @SwaggerDoc({ summary: 'Update System Settings', bodyType: UpdateSettingDto, status: 200 })
  @Put()
  @ResponseMessage('Cập nhật cài đặt hệ thống thành công')
  async update(@Body() dto: UpdateSettingDto) {
    return this.settingService.update(dto);
  }
}
