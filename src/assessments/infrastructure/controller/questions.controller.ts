import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuestionUseCase } from '../../application/use-cases/questions.use-case';
import { type QuestionBody } from '../../domain/entities/question.entity';

@Controller('questions')
export class QuestionsController {
    constructor(private readonly questionCase: QuestionUseCase) { }

    @Post()
    createQuestion(@Body() body: QuestionBody) {
        return this.questionCase.saveQuestion(body);
    }

    @Get()
    findAll() {
        return this.questionCase.findAllQuestions();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.questionCase.findQuestionById(id);
    }
}