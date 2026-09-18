export interface CompilationCheck {
    success: boolean;
    line?: number;
    message?: string;
}

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
    compilation: CompilationCheck;
}

export const CODE_EXECUTOR = 'CODE_EXECUTOR';

export interface CodeExecutorPort {
    execute(code: string, language: string, input: string): Promise<ExecutionResult>;
}
