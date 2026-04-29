import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddStudentToClassDto {
  @ApiProperty({ example: 'uuid-student-id' })
  @IsString()
  @IsNotEmpty()
  studentId: string;
}
