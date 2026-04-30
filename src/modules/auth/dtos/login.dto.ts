import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '26a4041675@hvnh.edu.vn'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+$/, {
    message: 'username không được chứa khoảng trắng'
  })
  username: string;

  @ApiProperty({
    example: 'dangquangtu'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password: string;
}
