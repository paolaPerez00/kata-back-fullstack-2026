import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CODE_EXECUTOR, type CodeExecutorPort } from '../../domain/ports/code-executor.port';
import { logOperation } from '../logging/operation-log';
import { assertValidCode } from '../validation/code-input';

@Injectable()
export class RunCodeUseCase {
    private readonly logger = new Logger(RunCodeUseCase.name);

    constructor(
        @Inject(CODE_EXECUTOR) private readonly executor: CodeExecutorPort,
    ) { }

    async execute(code: string, language: string, input: string) {
        return logOperation(this.logger, 'runCode', { language }, async (log) => {
            if (assertValidCode(code)) throw new BadRequestException('code must not be empty');
            if (typeof language !== 'string' || !language) throw new BadRequestException('language is required');
            if (input !== undefined && typeof input !== 'string') throw new BadRequestException('input must be a string');

            const result = await this.executor.execute(code, language, input ?? '');
            log.exitCode = result.exitCode;
            log.timedOut = result.timedOut;
            log.compiled = result.compilation.success;
            return result;
        });
    }
}
