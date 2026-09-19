import { Inject, Injectable, Logger } from '@nestjs/common';
import { CODE_EXECUTOR, type CodeExecutorPort } from '../../domain/ports/code-executor.port';
import { logOperation } from '../logging/operation-log';

@Injectable()
export class RunCodeUseCase {
    private readonly logger = new Logger(RunCodeUseCase.name);

    constructor(
        @Inject(CODE_EXECUTOR) private readonly executor: CodeExecutorPort,
    ) { }

    async execute(code: string, language: string, input: string) {
        return logOperation(this.logger, 'runCode', { language }, async (log) => {
            const result = await this.executor.execute(code, language, input);
            log.exitCode = result.exitCode;
            log.timedOut = result.timedOut;
            log.compiled = result.compilation.success;
            return result;
        });
    }
}
