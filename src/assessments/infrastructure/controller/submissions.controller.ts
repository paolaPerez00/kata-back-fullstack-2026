import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubmissionUseCase } from '../../application/use-cases/submission.use-case';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionCase: SubmissionUseCase) { }

    @Post()
    submit(@Body() body: { assessmentId: string; questionId: string; code: string; language: string }) {
        return this.submissionCase.submitAnswer(body.assessmentId, body.questionId, body.code, body.language);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submissionCase.findSubmissionById(id);
    }
}