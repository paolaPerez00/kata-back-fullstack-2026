import { Injectable, BadRequestException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { CodeExecutorPort, ExecutionResult, CompilationCheck } from '../../domain/ports/code-executor.port';

const execAsync = promisify(exec);

interface LangConfig {
    image: string;
    fileName: string;
    runCmd: (fileName: string) => string;
}

const LANG_CONFIG: Record<string, LangConfig> = {
    javascript: { image: 'node:24-alpine', fileName: 'main.js', runCmd: (f) => `node ${f}` },
    python: { image: 'python:3.12-alpine', fileName: 'main.py', runCmd: (f) => `python ${f}` },
    java: {
        image: 'eclipse-temurin:21-jdk-alpine',
        fileName: 'Main.java',
        runCmd: () => `sh -c "javac -d /tmp Main.java && java -cp /tmp Main"`,
    },
    typescript: {
        image: 'node:24-alpine',
        fileName: 'main.ts',
        runCmd: () => `sh -c "npx -y tsx main.ts"`,
    },
};

const TIMEOUT_MS = 8000;
const MEMORY_LIMIT = '128m';
const CPU_LIMIT = '0.5';

@Injectable()
export class DockerCodeExecutorAdapter implements CodeExecutorPort {
    async execute(code: string, language: string, input: string): Promise<ExecutionResult> {
        const config = LANG_CONFIG[language];
        if (!config) throw new BadRequestException(`Lenguaje no soportado: ${language}`);
        await this.ensureImage(config.image);

        const workDir = join(tmpdir(), `kata-${randomUUID()}`);
        await mkdir(workDir, { recursive: true });

        const codeFile = join(workDir, config.fileName);
        const inputFile = join(workDir, 'input.txt');
        await writeFile(codeFile, code, 'utf-8');
        await writeFile(inputFile, input ?? '', 'utf-8');

        const containerName = `kata-exec-${randomUUID()}`;
        const dockerCmd = [
            'docker run --rm',
            `--name ${containerName}`,
            '--network none',
            `--memory=${MEMORY_LIMIT}`,
            `--cpus=${CPU_LIMIT}`,
            '--pids-limit=64',
            '--read-only',
            '--tmpfs /tmp',
            `-v "${workDir}":/sandbox:ro`,
            '-w /sandbox',
            '-i',
            config.image,
            config.runCmd(config.fileName),
        ].join(' ');

        let timedOut = false;
        try {
            const { stdout, stderr } = await this.runWithTimeout(dockerCmd, inputFile, containerName);
            return {
                stdout,
                stderr,
                exitCode: 0,
                timedOut: false,
                compilation: { success: true },
            };
        } catch (err: any) {
            if (err.timedOut) timedOut = true;
            const stderr = timedOut ? 'Tiempo de ejecución excedido' : (err.stderr ?? err.message);

            return {
                stdout: err.stdout ?? '',
                stderr,
                exitCode: typeof err.code === 'number' ? err.code : 1,
                timedOut,
                compilation: timedOut
                    ? { success: false, message: 'Tiempo de ejecución excedido' }
                    : this.parseCompilationError(stderr, language),
            };
        } finally {
            await rm(workDir, { recursive: true, force: true }).catch(() => { });
            await execAsync(`docker rm -f ${containerName}`).catch(() => { });
        }
    }

    private parseCompilationError(stderr: string, language: string): CompilationCheck {
        if (!stderr) return { success: true };

        if (language === 'java') {
            const match = stderr.match(/Main\.java:(\d+):\s*error:\s*(.+)/);
            if (match) {
                return { success: false, line: parseInt(match[1]), message: match[2].trim() };
            }
        }

        if (language === 'python') {
            const lineMatch = stderr.match(/File ".*", line (\d+)/);
            const msgMatch = stderr.match(/(\w+Error): (.+)/);
            if (lineMatch) {
                return {
                    success: false,
                    line: parseInt(lineMatch[1]),
                    message: msgMatch ? `${msgMatch[1]}: ${msgMatch[2]}` : 'Error de sintaxis',
                };
            }
        }

        if (language === 'javascript' || language === 'typescript') {
            const ext = language === 'typescript' ? 'ts' : 'js';
            const lineMatch = stderr.match(new RegExp(`main\\.${ext}:(\\d+)`));
            const msgMatch = stderr.match(/(SyntaxError|ReferenceError|TypeError): (.+)/);
            if (lineMatch) {
                return {
                    success: false,
                    line: parseInt(lineMatch[1]),
                    message: msgMatch ? msgMatch[2] : 'Error de sintaxis',
                };
            }
        }

        return { success: true };
    }

    private runWithTimeout(
        dockerCmd: string,
        inputFile: string,
        containerName: string,
    ): Promise<{ stdout: string; stderr: string }> {
        return new Promise((resolve, reject) => {
            const fullCmd = `cat "${inputFile}" | ${dockerCmd}`;
            const child = exec(fullCmd, { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                clearTimeout(killer);
                if (error) {
                    const timedOut = (error as any).killed && (error as any).signal === 'SIGTERM';
                    reject({ ...error, stdout, stderr, timedOut });
                } else {
                    resolve({ stdout, stderr });
                }
            });

            const killer = setTimeout(() => {
                exec(`docker kill ${containerName}`).unref();
            }, TIMEOUT_MS);
        });
    }

    private async ensureImage(image: string): Promise<void> {
        try {
            await execAsync(`docker image inspect ${image}`);
        } catch {
            await execAsync(`docker pull ${image}`);
        }
    }
}