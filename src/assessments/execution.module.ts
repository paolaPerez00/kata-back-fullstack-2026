import { Module } from '@nestjs/common';
import { CODE_EXECUTOR } from './domain/ports/code-executor.port';
import { DockerCodeExecutorAdapter } from './infrastructure/execution/docker-code-executor.adapter';
import { RunCodeUseCase } from './application/use-cases/run-code.use-case';
import { ExecutionController } from './infrastructure/controller/execution.controller';

@Module({
    controllers: [ExecutionController],
    providers: [
        { provide: CODE_EXECUTOR, useClass: DockerCodeExecutorAdapter },
        RunCodeUseCase
    ],
    exports: [CODE_EXECUTOR],
})
export class ExecutionModule { }