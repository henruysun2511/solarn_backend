import { Module } from '@nestjs/common';

import { RoomService } from './services/room.service';
import { RoomController } from './controllers/room.controller';
import { RoomRepository } from './repositories/room.repository';

@Module({
  controllers: [RoomController],
  providers: [RoomService, RoomRepository]
})
export class RoomModule {}
