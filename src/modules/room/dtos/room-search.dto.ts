import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

import { RoomSortBy } from '../enums/room-sort-by.enum';

export class RoomSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(RoomSortBy)
  sortBy: RoomSortBy = RoomSortBy.ROOM_CODE;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
