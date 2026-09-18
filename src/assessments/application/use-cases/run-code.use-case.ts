import { Inject, Injectable } from '@nestjs/common';
import { CODE_EXECUTOR, type CodeExecutorPort } from '../../domain/ports/code-executor.port';

@Injectable()
export class RunCodeUseCase {
    constructor(
        @Inject(CODE_EXECUTOR) private readonly executor: CodeExecutorPort,
    ) { }

    async execute(code: string, language: string, input: string) {
        return this.executor.execute(code, language, input);
    }
}
