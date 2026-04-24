import { Injectable } from '@nestjs/common';

import { CreateClassDto } from '../dtos';
import { ClassRepository } from '../repositories/class.repository';

@Injectable()
export class ClassService {
  constructor(private readonly classRepo: ClassRepository) {}

  async create(classDto: CreateClassDto) {
    return this.classRepo.create(classDto);
  }
}
