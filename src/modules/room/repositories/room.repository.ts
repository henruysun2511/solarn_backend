import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { CreateRoomDto, RoomSearchDto, UpdateRoomDto } from '../dtos';

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

  async findMany(query: RoomSearchDto) {
    const { page, limit, search, sortBy, sortOrder, branchId } = query;
    return this.prisma.room.findMany({
      where: {
        ...(search ? { roomCode: { contains: search, mode: 'insensitive' } } : {}),
        ...(branchId ? { branchId } : {})
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        branch: true
      }
    });
  }

  async count(query: RoomSearchDto) {
    const { search, branchId } = query;
    return this.prisma.room.count({
      where: {
        ...(search ? { roomCode: { contains: search, mode: 'insensitive' } } : {}),
        ...(branchId ? { branchId } : {})
      }
    });
  }

  async update(roomId: string, dto: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { roomId },
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

  async delete(roomId: string) {
    return this.prisma.room.delete({
      where: { roomId }
    });
  }
}
