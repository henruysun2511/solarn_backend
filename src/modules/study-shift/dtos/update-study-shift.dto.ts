import { PartialType } from '@nestjs/swagger';

import { CreateStudyShiftDto } from './create-study-shift.dto';

export class UpdateStudyShiftDto extends PartialType(CreateStudyShiftDto) {}
