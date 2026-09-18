import { Body, Controller, Post } from '@nestjs/common';
import { RunCodeUseCase } from '../../application/use-cases/run-code.use-case';

@Controller()
export class ExecutionController {
    constructor(private readonly runCodeCase: RunCodeUseCase) { }

    @Post('run')
    run(@Body() body: { code: string; language: string; input: string }) {
        return this.runCodeCase.execute(body.code, body.language, body.input);
    }
}