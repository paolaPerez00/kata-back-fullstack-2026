import { Assessment } from '../entities/assessment.entity';

export const ASSESSMENT_REPOSITORY = 'ASSESSMENT_REPOSITORY';

export interface AssessmentRepositoryPort {
    save(assessment: Assessment): Promise<Assessment>;
    findById(id: string): Promise<Assessment | null>;
    findAll(): Promise<Assessment[]>;
}
