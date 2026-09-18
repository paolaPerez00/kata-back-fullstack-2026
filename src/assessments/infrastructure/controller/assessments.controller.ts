import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssessmentUseCase } from '../../application/use-cases/assessment.use-case';

@Controller('assessments')
export class AssessmentsController {
    constructor(private readonly assessmentCase: AssessmentUseCase) { }

    @Post()
    create(@Body() body: { name: string; description: string; durationMinutes: number, questionIds?: string[] }) {
        return this.assessmentCase.saveAssessment(body.name, body.description, body.durationMinutes, body.questionIds);
    }

    @Get()
    findAll() {
        return this.assessmentCase.findAssessmentAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.assessmentCase.findAssessmentById(id);
    }

    @Get(':id/results')
    get(@Param('id') id: string) {
        return this.assessmentCase.getAssesmentResult(id);
    }

    @Post(':id/questions')
    addQuestions(@Param('id') id: string, @Body() body: { questionIds: string[] }) {
        return this.assessmentCase.addQuestionsToAssessment(id, body.questionIds);
    }
}
