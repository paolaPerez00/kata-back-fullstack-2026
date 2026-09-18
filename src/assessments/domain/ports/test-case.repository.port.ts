import { TestCase } from "../../domain/entities/test-case.entity";

export const TEST_CASE_REPOSITORY = 'TEST_CASE_REPOSITORY';

export interface TestCaseRepositoryPort {
    save(testCase: TestCase): Promise<TestCase>;
    findByQuestionId(questionId: string): Promise<TestCase[]>;
}
