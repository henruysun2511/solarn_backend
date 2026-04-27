import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { CreateRoomDto } from '../dtos';

@Injectable()
export class RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        roomCode: dto.roomCode,
        capacity: dto.capacity,
        ...(dto.branchId
          ? {
              branch: {
                connect: {
                  branchId: dto.branchId
                }
              }
            }
          : {})
      }
    });
  }
}
