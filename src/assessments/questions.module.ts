import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionOrmEntity } from './infrastructure/persistence/question.orm-entity';
import { QuestionPostgresRepository } from './infrastructure/persistence/question-postgres.repository';
import { QUESTION_REPOSITORY } from './domain/ports/question.repository.port';
import { TestCaseOrmEntity } from './infrastructure/persistence/test-case.orm-entity';
import { TestCasePostgresRepository } from './infrastructure/persistence/test-case-postgres.repository';
import { TEST_CASE_REPOSITORY } from './domain/ports/test-case.repository.port';
import { QuestionUseCase } from './application/use-cases/questions.use-case';
import { QuestionsController } from './infrastructure/controller/questions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([QuestionOrmEntity, TestCaseOrmEntity])],
    providers: [
        { provide: QUESTION_REPOSITORY, useClass: QuestionPostgresRepository },
        { provide: TEST_CASE_REPOSITORY, useClass: TestCasePostgresRepository },
        QuestionUseCase
    ],
    controllers: [QuestionsController],
    exports: [QUESTION_REPOSITORY, TEST_CASE_REPOSITORY],
})
export class QuestionsModule { }