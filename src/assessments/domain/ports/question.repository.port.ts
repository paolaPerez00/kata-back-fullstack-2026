import { Question } from '../entities/question.entity';

export const QUESTION_REPOSITORY = 'QUESTION_REPOSITORY';

export interface QuestionRepositoryPort {
    save(question: Question): Promise<Question>;
    findById(id: string): Promise<Question | null>;
    findAll(): Promise<Question[]>;
    findByIds(ids: string[]): Promise<Question[]>;
}
