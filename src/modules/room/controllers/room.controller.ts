import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { RoomService } from '../services/room.service';
import { CreateRoomDto } from '../dtos';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @SwaggerDoc({
    summary: 'Create Room',
    bodyType: CreateRoomDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo thành công')
  async create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }
}
