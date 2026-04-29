import { PaginationDto } from 'shared/base';

export function paginate<T>(data: T[], total: number, query: PaginationDto) {
  const { page, limit } = query;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}
