import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Assessment } from '../../domain/entities/assessment.entity';
import { randomUUID } from 'crypto';
import { ASSESSMENT_REPOSITORY, type AssessmentRepositoryPort } from '../../domain/ports/assessment.repository.port';
import { SUBMISSION_REPOSITORY, type SubmissionRepositoryPort } from '../../domain/ports/submission.repository.port';
import { QUESTION_REPOSITORY, type QuestionRepositoryPort } from '../../domain/ports/question.repository.port';
import { logOperation } from '../logging/operation-log';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class AssessmentUseCase {
    private readonly logger = new Logger(AssessmentUseCase.name);

    constructor(
        @Inject(ASSESSMENT_REPOSITORY) private readonly assessmentPort: AssessmentRepositoryPort,
        @Inject(SUBMISSION_REPOSITORY) private readonly submissionPort: SubmissionRepositoryPort,
        @Inject(QUESTION_REPOSITORY) private readonly questionPort: QuestionRepositoryPort,
    ) { }

    async saveAssessment(name: string, description: string, durationMinutes: number, questionIds: string[] = [],): Promise<Assessment> {
        const requested = Array.isArray(questionIds) ? questionIds.length : undefined;
        return logOperation(this.logger, 'saveAssessment', { questions: requested }, async (log) => {
            await this.assertQuestionsExist(questionIds);
            const assessment = new Assessment(randomUUID(), name, description, durationMinutes);
            const saved = await this.assessmentPort.save(assessment);
            log.assessmentId = saved.id;

            if (questionIds.length > 0) {
                await this.assessmentPort.linkQuestions(saved.id, questionIds);
            }
            return saved;
        });
    }

    async findAssessmentAll() {
        return logOperation(this.logger, 'findAssessmentAll', {}, async (log) => {
            const assessments = await this.assessmentPort.findAll();
            log.total = assessments.length;
            return assessments;
        });
    }

    async findAssessmentById(id: string) {
        return logOperation(this.logger, 'findAssessmentById', { assessmentId: id }, async (log) => {
            const assessment = await this.assessmentPort.findById(id);
            if (!assessment) throw new NotFoundException('Assessment not found');

            const questionIds = await this.assessmentPort.findQuestionIdsByAssessment(id);
            const questions = await this.questionPort.findByIds(questionIds);
            log.questions = questions.length;

            return {
                id: assessment.id,
                name: assessment.name,
                description: assessment.description,
                durationMinutes: assessment.durationMinutes,
                questions: questions.map((q) => q.toSummary()),
            };
        });
    }

    async addQuestionsToAssessment(assessmentId: string, questionIds: string[]) {
        const requested = Array.isArray(questionIds) ? questionIds.length : undefined;
        return logOperation(this.logger, 'addQuestionsToAssessment', { assessmentId, questions: requested }, async () => {
            const assessment = await this.assessmentPort.findById(assessmentId);
            if (!assessment) throw new NotFoundException('Assessment not found');
            await this.assertQuestionsExist(questionIds);
            await this.assessmentPort.linkQuestions(assessmentId, questionIds);
            return { assessmentId, questionIds };
        });
    }

    private async assertQuestionsExist(questionIds: string[] = []) {
        if (!Array.isArray(questionIds)) throw new BadRequestException('questionIds must be an array');
        const unique = [...new Set(questionIds)];
        if (unique.length === 0) return;

        const malformed = unique.filter((id) => !UUID_PATTERN.test(id));
        if (malformed.length > 0) throw new BadRequestException(`Invalid question ids: ${malformed.join(', ')}`);

        const found = await this.questionPort.findByIds(unique);
        const foundIds = new Set(found.map((q) => q.id));
        const missing = unique.filter((id) => !foundIds.has(id));
        if (missing.length > 0) throw new BadRequestException(`Questions not found: ${missing.join(', ')}`);
    }

    async getAssesmentResult(assessmentId: string) {
        return logOperation(this.logger, 'getAssesmentResult', { assessmentId }, async (log) => {
            const all = await this.submissionPort.findByAssessmentId(assessmentId);
            const latest = new Map<string, (typeof all)[number]>();
            for (const s of all) {
                const prev = latest.get(s.questionId);
                if (!prev || s.submittedAt > prev.submittedAt) latest.set(s.questionId, s);
            }
            const submissions = [...latest.values()];

            const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
            const totalTestCases = submissions.reduce((sum, s) => sum + s.results.length, 0);
            const totalPassed = submissions.reduce(
                (sum, s) => sum + s.results.filter((r) => r.passed).length,
                0,
            );

            log.submissions = submissions.length;
            log.totalScore = totalScore;

            return {
                assessmentId,
                totalScore,
                totalQuestions: submissions.length,
                correctAnswers: submissions.filter((s) => s.score > 0).length,
                incorrectAnswers: submissions.filter((s) => s.score === 0).length,
                testCasesSummary: {
                    totalCases: totalTestCases,
                    passedCases: totalPassed,
                    failedCases: totalTestCases - totalPassed,
                    percentage: totalTestCases > 0 ? Math.round((totalPassed / totalTestCases) * 100) : 0,
                },
                submissions,
            };
        });
    }
}
