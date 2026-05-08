export const RoomSortBy = {
  ROOM_CODE: 'roomCode',
  CAPACITY: 'capacity'
} as const;

export type RoomSortBy = (typeof RoomSortBy)[keyof typeof RoomSortBy];
