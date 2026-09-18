import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentOrmEntity } from './infrastructure/persistence/assessment.orm-entity';
import { AssessmentPostgresRepository } from './infrastructure/persistence/assessment-postgres.repository';
import { ASSESSMENT_REPOSITORY } from './domain/ports/assessment.repository.port';
import { CreateAssessmentUseCase } from './application/use-cases/create-assessment.use-case';
import { AssessmentsController } from './infrastructure/http/assessments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AssessmentOrmEntity])],
    controllers: [AssessmentsController],
    providers: [
        CreateAssessmentUseCase,
        { provide: ASSESSMENT_REPOSITORY, useClass: AssessmentPostgresRepository },
    ],
})
export class AssessmentsModule { }