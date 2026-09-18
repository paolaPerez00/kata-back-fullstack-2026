import { Submission } from '../entities/submission.entity';

export const SUBMISSION_REPOSITORY = 'SUBMISSION_REPOSITORY';

export interface SubmissionRepositoryPort {
    save(submission: Submission): Promise<Submission>;
    findById(id: string): Promise<Submission | null>;
    findByAssessmentId(assessmentId: string): Promise<Submission[]>;
}
