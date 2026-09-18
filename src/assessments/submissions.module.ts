import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionOrmEntity } from './infrastructure/persistence/submission.orm-entity';
import { SubmissionPostgresRepository } from './infrastructure/persistence/submission-postgres.repository';
import { SUBMISSION_REPOSITORY } from './domain/ports/submission.repository.port';
import { SubmissionsController } from './infrastructure/controller/submissions.controller';
import { SubmissionUseCase } from './application/use-cases/submission.use-case';
import { QuestionsModule } from './questions.module';
import { ExecutionModule } from './execution.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SubmissionOrmEntity]),
        QuestionsModule,
        ExecutionModule
    ],
    controllers: [SubmissionsController],
    providers: [
        { provide: SUBMISSION_REPOSITORY, useClass: SubmissionPostgresRepository },
        SubmissionUseCase,
    ],
    exports: [SUBMISSION_REPOSITORY],
})
export class SubmissionsModule { }
