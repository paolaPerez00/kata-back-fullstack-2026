import { Body, Controller, Post } from '@nestjs/common';
import { CreateAssessmentUseCase } from '../../application/use-cases/create-assessment.use-case';

@Controller('assessments')
export class AssessmentsController {
    constructor(private readonly createAssessment: CreateAssessmentUseCase) { }

    @Post()
    create(@Body() body: { name: string; description: string; durationMinutes: number }) {
        return this.createAssessment.execute(body.name, body.description, body.durationMinutes);
    }
}
