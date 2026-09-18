import { Inject, Injectable } from '@nestjs/common';
import { Assessment } from '../../domain/entities/assessment.entity';
import { randomUUID } from 'crypto';
import { ASSESSMENT_REPOSITORY, type AssessmentRepositoryPort } from '../../domain/ports/assessment.repository.port';

@Injectable()
export class CreateAssessmentUseCase {
    constructor(
        @Inject(ASSESSMENT_REPOSITORY)
        private readonly repository: AssessmentRepositoryPort,
    ) { }

    async execute(name: string, description: string, durationMinutes: number): Promise<Assessment> {
        const assessment = new Assessment(randomUUID(), name, description, durationMinutes);
        return this.repository.save(assessment);
    }
}
