import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentOrmEntity } from './infrastructure/persistence/assessment.orm-entity';
import { AssessmentQuestionOrmEntity } from './infrastructure/persistence/assessment-question.orm-entity';
import { AssessmentPostgresRepository } from './infrastructure/persistence/assessment-postgres.repository';
import { ASSESSMENT_REPOSITORY } from './domain/ports/assessment.repository.port';
import { AssessmentUseCase } from './application/use-cases/assessment.use-case';
import { AssessmentsController } from './infrastructure/controller/assessments.controller';
import { SubmissionsModule } from './submissions.module';
import { QuestionsModule } from './questions.module';
@Module({
    imports: [
        TypeOrmModule.forFeature([AssessmentOrmEntity, AssessmentQuestionOrmEntity]),
        SubmissionsModule,
        QuestionsModule
    ],
    controllers: [
        AssessmentsController
    ],
    providers: [
        AssessmentUseCase,
        { provide: ASSESSMENT_REPOSITORY, useClass: AssessmentPostgresRepository }
    ],
})
export class AssessmentsModule { }