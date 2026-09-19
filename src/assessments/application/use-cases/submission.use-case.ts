import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SUBMISSION_REPOSITORY, type SubmissionRepositoryPort } from '../../domain/ports/submission.repository.port';
import { TEST_CASE_REPOSITORY, type TestCaseRepositoryPort } from '../../domain/ports/test-case.repository.port';
import { QUESTION_REPOSITORY, type QuestionRepositoryPort } from '../../domain/ports/question.repository.port';
import { Submission, TestCaseResult } from '../../domain/entities/submission.entity';
import { CODE_EXECUTOR, type CodeExecutorPort } from '../../domain/ports/code-executor.port';
import { randomUUID } from 'crypto';
import { logOperation } from '../logging/operation-log';

@Injectable()
export class SubmissionUseCase {
    private readonly logger = new Logger(SubmissionUseCase.name);

    constructor(
        @Inject(CODE_EXECUTOR) private readonly executorPort: CodeExecutorPort,
        @Inject(SUBMISSION_REPOSITORY) private readonly submissionPort: SubmissionRepositoryPort,
        @Inject(TEST_CASE_REPOSITORY) private readonly testCasePort: TestCaseRepositoryPort,
        @Inject(QUESTION_REPOSITORY) private readonly questionPort: QuestionRepositoryPort,
    ) { }


    async submitAnswer(assessmentId: string, questionId: string, code: string, language: string): Promise<Submission> {
        return logOperation(this.logger, 'submitAnswer', { assessmentId, questionId, language }, async (log) => {
            const question = await this.questionPort.findById(questionId);
            if (!question) throw new NotFoundException('Question not found');

            const testCases = await this.testCasePort.findByQuestionId(questionId);

            const results: TestCaseResult[] = [];
            for (const tc of testCases) {
                const execResult = await this.executorPort.execute(code, language, tc.input);
                const actualOutput = execResult.stdout.trim();
                const passed = !execResult.timedOut && execResult.exitCode === 0 && actualOutput === tc.expectedOutput.trim();

                this.logger.debug(
                    `submitAnswer testCase assessmentId=${assessmentId} testCaseId=${tc.id} passed=${passed} timedOut=${execResult.timedOut} exitCode=${execResult.exitCode}`,
                );

                results.push({
                    testCaseId: tc.id,
                    passed,
                    actualOutput,
                    expectedOutput: tc.expectedOutput,
                    errorMessage: execResult.stderr || (execResult.timedOut ? 'Timeout' : undefined),
                });
            }

            const submission = new Submission(randomUUID(), questionId, assessmentId, code, language);
            submission.grade(results, question.points);
            log.submissionId = submission.id;
            log.score = submission.score;
            log.passed = `${results.filter((r) => r.passed).length}/${results.length}`;

            return this.submissionPort.save(submission);
        });
    }


    async findSubmissionById(id: string) {
        return logOperation(this.logger, 'findSubmissionById', { submissionId: id }, async (log) => {
            const submission = await this.submissionPort.findById(id);
            if (!submission) throw new NotFoundException('Submission not found');
            log.assessmentId = submission.assessmentId;
            return submission;
        });
    }
}
