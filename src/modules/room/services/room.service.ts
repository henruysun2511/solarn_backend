import { Injectable } from '@nestjs/common';

import { RoomRepository } from '../repositories/room.repository';
import { CreateRoomDto } from '../dtos';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async create(roomDto: CreateRoomDto) {
    return this.roomRepo.create(roomDto);
  }
}
