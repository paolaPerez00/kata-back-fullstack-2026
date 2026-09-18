import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCaseOrmEntity } from './test-case.orm-entity';
import { TestCaseRepositoryPort } from '../../domain/ports/test-case.repository.port';
import { TestCase } from '../../domain/entities/test-case.entity';

@Injectable()
export class TestCasePostgresRepository implements TestCaseRepositoryPort {
    constructor(
        @InjectRepository(TestCaseOrmEntity)
        private readonly repo: Repository<TestCaseOrmEntity>,
    ) { }

    private toDomain(row: TestCaseOrmEntity): TestCase {
        return new TestCase(row.id, row.questionId, row.input, row.expectedOutput, row.isHidden);
    }

    async save(testCase: TestCase): Promise<TestCase> {
        const saved = await this.repo.save({
            id: testCase.id,
            questionId: testCase.questionId,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            isHidden: testCase.isHidden,
        });
        return this.toDomain(saved);
    }

    async findByQuestionId(questionId: string): Promise<TestCase[]> {
        const rows = await this.repo.find({ where: { questionId } });
        return rows.map((r) => this.toDomain(r));
    }
}
