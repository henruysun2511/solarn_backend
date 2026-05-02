import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { SortOrder } from 'common/enums';

import { CreateRoomDto, RoomSearchDto, UpdateRoomDto } from '../dtos';
import { RoomSortBy } from '../enums/room-sort-by.enum';
import { RoomService } from '../services/room.service';

@Controller('rooms')
@ApiBearerAuth()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @SwaggerDoc({
    summary: 'Get All Rooms',
    description: 'Retrieve rooms with pagination, sorting, search by roomCode, and filter by branchId.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by roomCode' })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Filter by branchId'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    description: 'Sort order (desc or asc).',
    example: SortOrder.DESC
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: Object.values(RoomSortBy),
    description: 'Sort field for rooms.'
  })
  @Get('')
  @ResponseMessage('Lấy danh sách phòng thành công')
  async findAll(@Query() query: RoomSearchDto) {
    return this.roomService.findAll(query);
  }

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

  @SwaggerDoc({
    summary: 'Update Room',
    bodyType: UpdateRoomDto,
    status: 200
  })
  @Put(':roomId')
  @ResponseMessage('Sửa phòng thành công')
  async update(@Param('roomId') roomId: string, @Body() dto: UpdateRoomDto) {
    return this.roomService.update(roomId, dto);
  }

  @SwaggerDoc({
    summary: 'Delete Room',
    status: 200
  })
  @Delete(':roomId')
  @ResponseMessage('Xóa phòng thành công')
  async delete(@Param('roomId') roomId: string) {
    return this.roomService.delete(roomId);
  }
}
