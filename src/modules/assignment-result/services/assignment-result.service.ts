import { Injectable } from '@nestjs/common';

import { AssignmentResultRepository } from '../repositories/assignment-result.repository';
import { UpsertAssignmentResultDto } from '../dtos';

@Injectable()
export class AssignmentResultService {
  constructor(private readonly assignmentResultRepo: AssignmentResultRepository) {}

  upsertMany(items: UpsertAssignmentResultDto[], gradedById: string) {
    return this.assignmentResultRepo.upsertMany(items, gradedById);
  }
}
