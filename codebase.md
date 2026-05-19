Cấu trúc Base Module (NestJS + Prisma)
Tổng quan
Một module tiêu chuẩn bao gồm các thành phần chính sau:

Controller: Xử lý Request/Response, áp dụng các decorator Swagger và phân quyền (Authentication/Authorization).

Service: Xử lý logic nghiệp vụ (Business Logic) và gọi đến Repository.

Repository: Tương tác trực tiếp với cơ sở dữ liệu thông qua Prisma Client, chịu trách nhiệm xây dựng các điều kiện lọc (where clause).

DTOs (Data Transfer Objects): Thực hiện Validation và Transform dữ liệu đầu vào.

Enum: Định nghĩa các giá trị cố định được sử dụng hệ thống (ví dụ: sortBy, sortOrder,...).

Module: Đóng gói và tích hợp tất cả các thành phần trên lại với nhau.

Cấu trúc thư mục (Ví dụ với module branch)
Plaintext
src/modules/branch/
├── controllers/
│ └── branch.controller.ts
├── services/
│ └── branch.service.ts
├── repositories/
│ └── branch.repository.ts
├── dtos/
│ ├── create-branch.dto.ts
│ ├── update-branch.dto.ts
│ ├── branch-search.dto.ts
│ └── index.ts
├── enums/
│ └── branch-sort-by.enum.ts
└── branch.module.ts

1. DTO cơ sở: PaginationDto và SearchDto
   (Các lớp này đã được xây dựng sẵn ở tầng Core/Shared, các module con chỉ cần kế thừa lại)

base-pagination.dto.ts
TypeScript
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
page: number = 1;

@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
@Max(100)
limit: number = 10;

get skip() {
return (this.page - 1) \* this.limit;
}
}
base-search.dto.ts
TypeScript
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'common/enums'; // ASC | DESC
import { PaginationDto } from './base-pagination.dto';

export class SearchDto extends PaginationDto {
@IsOptional()
@IsString()
@Transform(({ value }) => value?.trim())
search?: string;

@IsOptional()
@Transform(({ value }) => {
if (value === undefined || value === null || value === '') return undefined;
const normalized = String(value).trim().toLowerCase();
if (normalized === '0' || normalized === 'desc') return SortOrder.DESC;
if (normalized === '1' || normalized === 'asc') return SortOrder.ASC;
return value;
})
@IsEnum(SortOrder)
sortOrder: SortOrder = SortOrder.DESC;
} 2. Enum cho sortBy
(Sử dụng const object kết hợp với typeof để đảm bảo Type-safe trong TypeScript)

branch-sort-by.enum.ts
TypeScript
export const BranchSortBy = {
BRANCH_CODE: 'branchCode',
BRANCH_NAME: 'branchName',
CREATED_AT: 'createdAt'
} as const;

export type BranchSortBy = typeof BranchSortBy[keyof typeof BranchSortBy]; 3. DTO cho module cụ thể
create-branch.dto.ts
Sử dụng class-validator để kiểm tra dữ liệu đầu vào: @IsNotEmpty(), @MaxLength(), @IsBoolean(),...

Chuyển đổi kiểu dữ liệu Boolean từ Query String ('true'/'false') sang kiểu dữ liệu boolean nguyên bản.

Tích hợp @ApiProperty để tự động tạo tài liệu API Swagger.

TypeScript
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
@ApiProperty({ maxLength: 50 })
@IsString()
@IsNotEmpty()
@MaxLength(50)
branchCode: string;

@ApiProperty({ maxLength: 255 })
@IsString()
@IsNotEmpty()
@MaxLength(255)
branchName: string;

@ApiProperty()
@IsString()
@IsNotEmpty()
address: string;

@ApiPropertyOptional({ maxLength: 20 })
@IsString()
@IsOptional()
@MaxLength(20)
phone?: string;

@ApiPropertyOptional({ default: true })
@Transform(({ value }) => {
if (typeof value === 'boolean') return value;
if (value === 'true') return true;
if (value === 'false') return false;
return value;
})
@IsBoolean()
@IsOptional()
isActive?: boolean;
}
update-branch.dto.ts
Sử dụng hàm PartialType từ thư viện @nestjs/swagger để kế thừa lại toàn bộ các thuộc tính từ CreateBranchDto nhưng tự động chuyển chúng về trạng thái optional.

TypeScript
import { PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
branch-search.dto.ts
Kế thừa lớp SearchDto toàn cục và bổ sung thêm các bộ lọc đặc thù riêng của module branch.

TypeScript
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';
import { BranchSortBy } from '../enums/branch-sort-by.enum';

export class BranchSearchDto extends SearchDto {
@IsOptional()
@IsEnum(BranchSortBy)
sortBy: BranchSortBy = BranchSortBy.CREATED_AT;

@IsOptional()
@Transform(({ value }) => {
if (typeof value === 'boolean') return value;
if (value === 'true') return true;
if (value === 'false') return false;
return undefined;
})
@IsBoolean()
isActive?: boolean;
} 4. Repository
branch.repository.ts
Inject PrismaService để thao tác với cơ sở dữ liệu.

Xây dựng hàm private buildWhere() để bóc tách dữ liệu từ DTO Search và chuyển đổi thành Prisma.BranchWhereInput.

Sử dụng phương thức prisma.branch.findMany kết hợp với các tham số skip, take, orderBy phục vụ phân trang.

Cung cấp đầy đủ các phương thức cơ bản: findMany, count, create, update, delete.

TypeScript
import { Injectable } from '@nestjs/common';
import { Prisma, Branch } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { BranchSearchDto } from '../dtos/branch-search.dto';
import { UpdateBranchDto } from '../dtos/update-branch.dto';

@Injectable()
export class BranchRepository {
constructor(private readonly prisma: PrismaService) {}

private buildWhere(query: BranchSearchDto): Prisma.BranchWhereInput {
const { search, isActive } = query;
const where: Prisma.BranchWhereInput = {};

    if (search) {
      where.OR = [
        { branchCode: { contains: search, mode: 'insensitive' } },
        { branchName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return where;

}

async findMany(query: BranchSearchDto): Promise<Branch[]> {
const { skip, limit, sortBy, sortOrder } = query;
const where = this.buildWhere(query);
return this.prisma.branch.findMany({
where,
skip,
take: limit,
orderBy: { [sortBy]: sortOrder }
});
}

async count(query: BranchSearchDto): Promise<number> {
return this.prisma.branch.count({ where: this.buildWhere(query) });
}

async create(data: Prisma.BranchCreateInput) {
return this.prisma.branch.create({ data });
}

async update(branchId: string, data: UpdateBranchDto) {
return this.prisma.branch.update({
where: { branchId },
data
});
}

async delete(branchId: string) {
return this.prisma.branch.delete({ where: { branchId } });
}
} 5. Service
branch.service.ts
Inject BranchRepository vào lớp.

Sử dụng helper paginate nhằm chuẩn hóa cấu trúc dữ liệu trả về cho Client.

Sử dụng Promise.all khi thực hiện câu lệnh truy vấn danh sách và đếm tổng số bản ghi để tối ưu hiệu năng.

TypeScript
import { Injectable } from '@nestjs/common';
import { paginate } from 'shared/helpers';
import { BranchSearchDto, CreateBranchDto } from '../dtos';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { BranchRepository } from '../repositories/branch.repository';

@Injectable()
export class BranchService {
constructor(private readonly branchRepo: BranchRepository) {}

async create(dto: CreateBranchDto) {
return this.branchRepo.create(dto);
}

async findAll(query: BranchSearchDto) {
const [data, total] = await Promise.all([
this.branchRepo.findMany(query),
this.branchRepo.count(query)
]);
return paginate(data, total, query);
}

async update(branchId: string, dto: UpdateBranchDto) {
return this.branchRepo.update(branchId, dto);
}

async delete(branchId: string) {
return this.branchRepo.delete(branchId);
}
} 6. Helper Phân Trang (Paginate Helper)
paginate.helper.ts
TypeScript
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
} 7. Controller
branch.controller.ts
Sử dụng các decorator cốt lõi: @Controller, @ApiBearerAuth(), @Public() (nếu endpoint mở công khai).

Cấu hình Swagger: Sử dụng custom decorator @SwaggerDoc hoặc kết hợp các @ApiQuery riêng lẻ tương ứng từng tham số.

Sử dụng custom decorator @ResponseMessage để chuẩn hóa câu thông báo phản hồi về phía Client.

Định nghĩa đầy đủ bộ Endpoint tiêu chuẩn Restful API: GET (phân trang), POST, PUT, DELETE.

TypeScript
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';
import { BranchSearchDto, CreateBranchDto } from '../dtos';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { BranchSortBy } from '../enums/branch-sort-by.enum';
import { BranchService } from '../services/branch.service';

@Controller('branches')
@ApiBearerAuth()
export class BranchController {
constructor(private readonly branchService: BranchService) {}

@SwaggerDoc({
summary: 'Get All Branches',
description: 'Retrieve branches with pagination, sorting, search and filter',
status: 200
})
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'search', required: false, type: String })
@ApiQuery({ name: 'isActive', required: false, type: Boolean })
@ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
@ApiQuery({ name: 'sortBy', required: false, enum: Object.values(BranchSortBy) })
@Public() // Bật decorator này nếu route không yêu cầu xác thực JWT
@Get()
@ResponseMessage('Lấy danh sách thành công')
async findAll(@Query() query: BranchSearchDto) {
return this.branchService.findAll(query);
}

@SwaggerDoc({ summary: 'Create Branch', bodyType: CreateBranchDto, status: 201 })
@Post()
@ResponseMessage('Thêm thành công')
async create(@Body() dto: CreateBranchDto) {
return this.branchService.create(dto);
}

@SwaggerDoc({ summary: 'Update Branch', bodyType: UpdateBranchDto, status: 200 })
@Put(':branchId')
@ResponseMessage('Sửa thành công')
async update(@Param('branchId') branchId: string, @Body() dto: UpdateBranchDto) {
return this.branchService.update(branchId, dto);
}

@SwaggerDoc({ summary: 'Delete Branch', status: 200 })
@Delete(':branchId')
@ResponseMessage('Xóa thành công')
async delete(@Param('branchId') branchId: string) {
return this.branchService.delete(branchId);
}
} 8. Module
branch.module.ts
TypeScript
import { Module } from '@nestjs/common';
import { BranchService } from './services/branch.service';
import { BranchController } from './controllers/branch.controller';
import { BranchRepository } from './repositories/branch.repository';

@Module({
controllers: [BranchController],
providers: [BranchService, BranchRepository]
})
export class BranchModule {}
Các lưu ý quan trọng khi khởi tạo một module mới
[!IMPORTANT]
Cấu trúc trên là cấu trúc Base nguyên bản, tuy nhiên tùy theo đặc thù nghiệp vụ mà bạn cần linh hoạt điều chỉnh cho phù hợp.

Logic nghiệp vụ đặc thù: Bổ sung các phương thức nghiệp vụ mở rộng vào Service hoặc Repository khi cần (ví dụ: findByCode, softDelete, restore, bulkCreate,...).

Phân quyền & Bảo mật: Cân nhắc sử dụng hợp lý giữa decorator @Public() (mở cho tất cả) và phân quyền chi tiết hơn với @Roles() cho từng vai trò người dùng cụ thể trên từng Endpoint.

Kiểm tra tính duy nhất (Validation Unique): Với các trường mang giá trị định danh duy nhất (Unique field), bắt buộc phải viết thêm logic truy vấn kiểm tra trùng lặp tại Service trước khi tiến hành thực thi hành động Tạo/Cập nhật dữ liệu.

Quan hệ giữa các bảng (Relations): Khi thực hiện truy vấn findMany cần nhúng thêm dữ liệu từ các bảng quan hệ (include), hãy tham số hóa tùy chọn này hoặc tạo lập một DTO chuyên biệt.

Xóa mềm (Soft Delete): Nếu nghiệp vụ bắt buộc lưu vết không xóa hẳn bản ghi, hãy chuyển sang dùng cờ trạng thái kiểu isDeleted: true hoặc deletedAt: Date. Song song đó, hãy cập nhật lại hàm buildWhere để lọc loại bỏ các bản ghi đã xóa này một cách tự động.

Custom Transform: Chú ý xử lý chuyển đổi kiểu dữ liệu chuẩn xác cho các trường dạng Boolean, Enum, hay Date khi hứng dữ liệu từ Query String gửi lên.

Sắp xếp động (Dynamic SortBy): Định nghĩa một phân vùng Enum sortBy riêng biệt cho từng module nếu module đó cho phép sắp xếp linh hoạt theo nhiều trường thông tin khác nhau.

Checklist các bước triển khai một module mới nhanh chóng
[ ] Bước 1: Tạo thư mục gốc cho module mới nằm trong thư mục src/modules/ (Ví dụ: product).

[ ] Bước 2: Khởi tạo cấu trúc các thư mục con tương ứng bên trong bao gồm: controllers, services, repositories, dtos, enums.

[ ] Bước 3: Khai báo và cấu hình tệp Enum định nghĩa các trường phục vụ sắp xếp (sortBy) nếu module có yêu cầu.

[ ] Bước 4: Tạo các tệp DTO nghiệp vụ: CreateDto, UpdateDto (Sử dụng hàm PartialType) và SearchDto (Kế thừa từ SearchDto base).

[ ] Bước 5: Viết mã nguồn cho Repository: Triển khai hàm nội bộ buildWhere và các hàm tương tác DB chính như findMany, count, create, update, delete.

[ ] Bước 6: Viết mã nguồn cho Service: Tiến hành Inject Repository vừa tạo, triển khai các hàm logic và kết xuất kết quả thông qua helper paginate.

[ ] Bước 7: Thiết lập Controller: Inject Service, cấu hình các định tuyến Endpoint (GET, POST, PUT, DELETE) đồng thời gắn đầy đủ các decorator Swagger tài liệu.

[ ] Bước 8: Cấu hình Module: Tiến hành đăng ký Controller và danh sách Providers (Service, Repository) tương ứng vào file module vừa tạo.

[ ] Bước 9: Khai báo và Nhập (Import) Module mới tạo vào trong AppModule hệ thống (hoặc một Module tổng quản lý cấp cha).

[ ] Bước 10: Thực thi câu lệnh Migration dữ liệu của Prisma (npx prisma migrate dev) nếu có phát sinh hay bổ sung thêm Model thực thể mới vào cơ sở dữ liệu.
