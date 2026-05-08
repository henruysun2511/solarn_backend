import { Injectable } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { CreateRoomDto, RoomSearchDto, UpdateRoomDto } from '../dtos';
import { RoomRepository } from '../repositories/room.repository';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async create(roomDto: CreateRoomDto) {
    return this.roomRepo.create(roomDto);
  }

  async findAll(query: RoomSearchDto) {
    const [data, total] = await Promise.all([this.roomRepo.findMany(query), this.roomRepo.count(query)]);
    return paginate(data, total, query);
  }

  async update(roomId: string, dto: UpdateRoomDto) {
    return this.roomRepo.update(roomId, dto);
  }

  async delete(roomId: string) {
    return this.roomRepo.delete(roomId);
  }
}
