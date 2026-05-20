# 📚 Cấu trúc Base Module (NestJS + Prisma)

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Chi tiết từng thành phần](#chi-tiết-từng-thành-phần)
4. [Lưu ý quan trọng](#lưu-ý-quan-trọng)
5. [Checklist triển khai](#checklist-triển-khai)

---

## 🎯 Tổng quan

Một module tiêu chuẩn bao gồm các thành phần chính sau:

| Thành phần | Chức năng |
|-----------|----------|
| **Controller** | Xử lý Request/Response, áp dụng các decorator Swagger và phân quyền (Authentication/Authorization) |
| **Service** | Xử lý logic nghiệp vụ (Business Logic) và gọi đến Repository |
| **Repository** | Tương tác trực tiếp với cơ sở dữ liệu thông qua Prisma Client, chịu trách nhiệm xây dựng các điều kiện lọc (where clause) |
| **DTOs** | Thực hiện Validation và Transform dữ liệu đầu vào (Data Transfer Objects) |
| **Enums** | Định nghĩa các giá trị cố định được sử dụng hệ thống (ví dụ: sortBy, sortOrder,...) |
| **Module** | Đóng gói và tích hợp tất cả các thành phần trên lại với nhau |

---

## 📁 Cấu trúc thư mục

**Ví dụ với module `branch`:**

```
src/modules/branch/
├── controllers/
│   └── branch.controller.ts
├── services/
│   └── branch.service.ts
├── repositories/
│   └── branch.repository.ts
├── dtos/
│   ├── create-branch.dto.ts
│   ├── update-branch.dto.ts
│   ├── branch-search.dto.ts
│   └── index.ts
├── enums/
│   └── branch-sort-by.enum.ts
└── branch.module.ts
```

---

## 🔧 Chi tiết từng thành phần

### 1️⃣ DTO cơ sở: `PaginationDto` và `SearchDto`

> **Lưu ý:** Các lớp này đã được xây dựng sẵn ở tầng Core/Shared, các module con chỉ cần kế thừa lại.

#### `base-pagination.dto.ts`

```typescript
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
    return (this.page - 1) * this.limit;
  }
}
```

#### `base-search.dto.ts`

```typescript
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
}
```

---

### 2️⃣ Enum cho `sortBy`

> **Lưu ý:** Sử dụng const object kết hợp với typeof để đảm bảo Type-safe trong TypeScript

#### `branch-sort-by.enum.ts`

```typescript
export const BranchSortBy = {
  BRANCH_CODE: 'branchCode',
  BRANCH_NAME: 'branchName',
  CREATED_AT: 'createdAt'
} as const;

export type BranchSortBy = typeof BranchSortBy[keyof typeof BranchSortBy];
```

---

### 3️⃣ DTO cho module cụ thể

#### `create-branch.dto.ts`

**Các điểm cần lưu ý:**
- ✅ Sử dụng class-validator để kiểm tra dữ liệu đầu vào: `@IsNotEmpty()`, `@MaxLength()`, `@IsBoolean()`,...
- ✅ Chuyển đổi kiểu dữ liệu Boolean từ Query String ('true'/'false') sang kiểu dữ liệu boolean nguyên bản
- ✅ Tích hợp `@ApiProperty` để tự động tạo tài liệu API Swagger

```typescript
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
```

#### `update-branch.dto.ts`

**Các điểm cần lưu ý:**
- ✅ Sử dụng hàm `PartialType` từ thư viện `@nestjs/swagger` để kế thừa lại toàn bộ các thuộc tính từ `CreateBranchDto` nhưng tự động chuyển chúng về trạng thái optional

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
```

#### `branch-search.dto.ts`

**Các điểm cần lưu ý:**
- ✅ Kế thừa lớp `SearchDto` toàn cục
- ✅ Bổ sung thêm các bộ lọc đặc thù riêng của module branch

```typescript
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
}
```

---

### 4️⃣ Repository

#### `branch.repository.ts`

**Các điểm cần lưu ý:**
- ✅ Inject `PrismaService` để thao tác với cơ sở dữ liệu
- ✅ Xây dựng hàm private `buildWhere()` để bóc tách dữ liệu từ DTO Search
- ✅ Chuyển đổi thành `Prisma.BranchWhereInput`
- ✅ Sử dụng phương thức `prisma.branch.findMany` kết hợp với các tham số `skip`, `take`, `orderBy`
- ✅ Cung cấp đầy đủ các phương thức cơ bản: `findMany`, `count`, `create`, `update`, `delete`

```typescript
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
}
```

---

### 5️⃣ Service

#### `branch.service.ts`

**Các điểm cần lưu ý:**
- ✅ Inject `BranchRepository` vào lớp
- ✅ Sử dụng helper `paginate` nhằm chuẩn hóa cấu trúc dữ liệu trả về cho Client
- ✅ Sử dụng `Promise.all` khi thực hiện câu lệnh truy vấn danh sách và đếm tổng số bản ghi để tối ưu hiệu năng

```typescript
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
}
```

---

### 6️⃣ Helper Phân Trang

#### `paginate.helper.ts`

```typescript
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
```

---

### 7️⃣ Controller

#### `branch.controller.ts`

**Các điểm cần lưu ý:**
- ✅ Sử dụng các decorator cốt lõi: `@Controller`, `@ApiBearerAuth()`, `@Public()` (nếu endpoint mở công khai)
- ✅ Cấu hình Swagger: Sử dụng custom decorator `@SwaggerDoc` hoặc kết hợp các `@ApiQuery` riêng lẻ
- ✅ Sử dụng custom decorator `@ResponseMessage` để chuẩn hóa câu thông báo phản hồi
- ✅ Định nghĩa đầy đủ bộ Endpoint tiêu chuẩn RESTful API: GET (phân trang), POST, PUT, DELETE

```typescript
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
  @Public()
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
}
```

---

### 8️⃣ Module

#### `branch.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BranchService } from './services/branch.service';
import { BranchController } from './controllers/branch.controller';
import { BranchRepository } from './repositories/branch.repository';

@Module({
  controllers: [BranchController],
  providers: [BranchService, BranchRepository]
})
export class BranchModule {}
```

---

## ⚠️ Lưu ý quan trọng khi khởi tạo một module mới

> **QUAN TRỌNG:** Cấu trúc trên là cấu trúc Base nguyên bản, tuy nhiên tùy theo đặc thù nghiệp vụ mà bạn cần linh hoạt điều chỉnh cho phù hợp.

### ✨ Các điểm lưu ý chi tiết:

1. **Logic nghiệp vụ đặc thù**
   - Bổ sung các phương thức nghiệp vụ mở rộng vào Service hoặc Repository khi cần
   - Ví dụ: `findByCode`, `softDelete`, `restore`, `bulkCreate`,...

2. **Phân quyền & Bảo mật**
   - Cân nhắc sử dụng hợp lý giữa decorator `@Public()` (mở cho tất cả)
   - Sử dụng phân quyền chi tiết hơn với `@Roles()` cho từng vai trò người dùng cụ thể

3. **Kiểm tra tính duy nhất (Validation Unique)**
   - Với các trường mang giá trị định danh duy nhất (Unique field)
   - Bắt buộc phải viết thêm logic truy vấn kiểm tra trùng lặp trước khi create/update

4. **Quan hệ giữa các bảng (Relations)**
   - Khi thực hiện truy vấn `findMany` cần nhúng thêm dữ liệu từ các bảng quan hệ (include)
   - Hãy tham số hóa tùy chọn này hoặc tạo logic xử lý linh hoạt

5. **Xóa mềm (Soft Delete)**
   - Nếu nghiệp vụ bắt buộc lưu vết không xóa hẳn bản ghi
   - Hãy chuyển sang dùng cờ trạng thái kiểu `isDeleted: true` hoặc `deletedAt: Date`

6. **Custom Transform**
   - Chú ý xử lý chuyển đổi kiểu dữ liệu chuẩn xác cho các trường dạng Boolean, Enum, hay Date
   - Điều này rất quan trọng khi hứng dữ liệu từ Query String

7. **Sắp xếp động (Dynamic SortBy)**
   - Định nghĩa một phân vùng Enum `sortBy` riêng biệt cho từng module nếu module đó cho phép sắp xếp linh hoạt theo nhiều trường thông tin

---

## ✅ Checklist triển khai một module mới nhanh chóng

- [ ] **Bước 1:** Tạo thư mục gốc cho module mới nằm trong thư mục `src/modules/` (Ví dụ: `product`)

- [ ] **Bước 2:** Khởi tạo cấu trúc các thư mục con tương ứng bên trong:
  - `controllers/`
  - `services/`
  - `repositories/`
  - `dtos/`
  - `enums/`

- [ ] **Bước 3:** Khai báo và cấu hình tệp Enum định nghĩa các trường phục vụ sắp xếp (`sortBy`) nếu module có yêu cầu

- [ ] **Bước 4:** Tạo các tệp DTO nghiệp vụ:
  - `CreateDto`
  - `UpdateDto` (Sử dụng hàm `PartialType`)
  - `SearchDto` (Kế thừa từ `SearchDto` base)

- [ ] **Bước 5:** Viết mã nguồn cho Repository:
  - Triển khai hàm nội bộ `buildWhere()`
  - Các hàm tương tác DB chính: `findMany`, `count`, `create`, `update`, `delete`

- [ ] **Bước 6:** Viết mã nguồn cho Service:
  - Inject Repository vừa tạo
  - Triển khai các hàm logic
  - Kết xuất kết quả thông qua helper `paginate`

- [ ] **Bước 7:** Thiết lập Controller:
  - Inject Service
  - Cấu hình các định tuyến Endpoint (GET, POST, PUT, DELETE)
  - Gắn đầy đủ các decorator Swagger tài liệu

- [ ] **Bước 8:** Cấu hình Module:
  - Đăng ký Controller
  - Đăng ký danh sách Providers (Service, Repository)

- [ ] **Bước 9:** Khai báo và Nhập (Import) Module mới tạo vào trong `AppModule` hệ thống
  - (hoặc một Module tổng quản lý cấp cha)

- [ ] **Bước 10:** Thực thi câu lệnh Migration dữ liệu của Prisma:
  - `npx prisma migrate dev` nếu có phát sinh hay bổ sung thêm Model thực thể mới vào cơ sở dữ liệu

---

## 📞 Hỗ trợ

Nếu bạn có thắc mắc hoặc cần giải thích chi tiết hơn về bất kỳ phần nào, vui lòng liên hệ hoặc tạo issue trong repository.
