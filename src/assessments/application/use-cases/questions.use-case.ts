import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QUESTION_REPOSITORY, type QuestionRepositoryPort } from '../../domain/ports/question.repository.port';
import { TEST_CASE_REPOSITORY, type TestCaseRepositoryPort } from '../../domain/ports/test-case.repository.port';
import { Question, QuestionBody } from '../../domain/entities/question.entity';
import { randomUUID } from 'crypto';
import { TestCase } from '../../domain/entities/test-case.entity';

@Injectable()
export class QuestionUseCase {
    constructor(
        @Inject(QUESTION_REPOSITORY) private readonly questionPort: QuestionRepositoryPort,
        @Inject(TEST_CASE_REPOSITORY) private readonly testCasePort: TestCaseRepositoryPort,
    ) { }

    async saveQuestion(body: QuestionBody) {
        const { title, description, allowedLanguages, points, testCases } = body ?? ({} as QuestionBody);
        if (!title || !description || !Array.isArray(allowedLanguages) || allowedLanguages.length === 0 || typeof points !== 'number') {
            throw new BadRequestException('title, description, allowedLanguages and points are required');
        }
        if (!Array.isArray(testCases) || testCases.length === 0) {
            throw new BadRequestException('testCases must be a non-empty array');
        }
        const question = new Question(randomUUID(), title, description, allowedLanguages, points);
        const saved = await this.questionPort.save(question);

        const savedTestCases: TestCase[] = [];
        for (const tc of testCases) {
            const testCase = new TestCase(randomUUID(), saved.id, tc.input, tc.expectedOutput, tc.isHidden ?? false);
            savedTestCases.push(await this.testCasePort.save(testCase));
        }
        // Quien crea la pregunta ve todos los casos, incluidos los ocultos.
        return {
            ...saved.toSummary(),
            testCases: savedTestCases.map(({ id, input, expectedOutput, isHidden }) => ({ id, input, expectedOutput, isHidden })),
        };
    }

    async findAllQuestions() {
        const questions = await this.questionPort.findAll();
        return questions.map((q) => q.toSummary());
    }

    async findQuestionById(id: string) {
        const question = await this.questionPort.findById(id);
        if (!question) throw new NotFoundException('Question not found');

        const testCases = await this.testCasePort.findByQuestionId(id);
        const visibleTestCases = testCases.filter((tc) => !tc.isHidden);

        return {
            ...question.toSummary(),
            testCases: visibleTestCases.map(({ id, input, expectedOutput }) => ({ id, input, expectedOutput })),
        };
    }
}