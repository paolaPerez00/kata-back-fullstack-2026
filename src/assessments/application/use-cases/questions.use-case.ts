import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QUESTION_REPOSITORY, type QuestionRepositoryPort } from '../../domain/ports/question.repository.port';
import { TEST_CASE_REPOSITORY, type TestCaseRepositoryPort } from '../../domain/ports/test-case.repository.port';
import { Question, QuestionBody, SupportedLanguage } from '../../domain/entities/question.entity';
import { randomUUID } from 'crypto';
import { TestCase } from '../../domain/entities/test-case.entity';

@Injectable()
export class QuestionUseCase {
    constructor(
        @Inject(QUESTION_REPOSITORY) private readonly questionPort: QuestionRepositoryPort,
        @Inject(TEST_CASE_REPOSITORY) private readonly testCasePort: TestCaseRepositoryPort,
    ) { }

    async saveQuestion(body: QuestionBody): Promise<Question> {
        const { title, description, allowedLanguages, points, testCases } = body;
        const question = new Question(randomUUID(), title, description, allowedLanguages, points);
        const saved = await this.questionPort.save(question);

        for (const tc of testCases) {
            const testCase = new TestCase(randomUUID(), saved.id, tc.input, tc.expectedOutput, tc.isHidden ?? false);
            await this.testCasePort.save(testCase);
        }
        return saved;
    }

    findAllQuestions() {
        return this.questionPort.findAll();
    }

    async findQuestionById(id: string) {
        const question = await this.questionPort.findById(id);
        if (!question) throw new NotFoundException('Question not found');

        const testCases = await this.testCasePort.findByQuestionId(id);
        const visibleTestCases = testCases.filter((tc) => !tc.isHidden);

        return { ...question, testCases: visibleTestCases };
    }
}