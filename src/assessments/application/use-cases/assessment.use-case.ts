import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Assessment } from '../../domain/entities/assessment.entity';
import { randomUUID } from 'crypto';
import { ASSESSMENT_REPOSITORY, type AssessmentRepositoryPort } from '../../domain/ports/assessment.repository.port';
import { SUBMISSION_REPOSITORY, type SubmissionRepositoryPort } from '../../domain/ports/submission.repository.port';
import { QUESTION_REPOSITORY, type QuestionRepositoryPort } from '../../domain/ports/question.repository.port';

@Injectable()
export class AssessmentUseCase {
    constructor(
        @Inject(ASSESSMENT_REPOSITORY) private readonly assessmentPort: AssessmentRepositoryPort,
        @Inject(SUBMISSION_REPOSITORY) private readonly submissionPort: SubmissionRepositoryPort,
        @Inject(QUESTION_REPOSITORY) private readonly questionPort: QuestionRepositoryPort,
    ) { }

    async saveAssessment(name: string, description: string, durationMinutes: number, questionIds: string[] = [],): Promise<Assessment> {
        await this.assertQuestionsExist(questionIds);
        const assessment = new Assessment(randomUUID(), name, description, durationMinutes);
        const saved = await this.assessmentPort.save(assessment);

        if (questionIds.length > 0) {
            await this.assessmentPort.linkQuestions(saved.id, questionIds);
        }
        return saved;
    }

    findAssessmentAll() {
        return this.assessmentPort.findAll();
    }

    async findAssessmentById(id: string) {
        const assessment = await this.assessmentPort.findById(id);
        if (!assessment) throw new NotFoundException('Assessment not found');

        const questionIds = await this.assessmentPort.findQuestionIdsByAssessment(id);
        const questions = await this.questionPort.findByIds(questionIds);

        return {
            id: assessment.id,
            name: assessment.name,
            description: assessment.description,
            durationMinutes: assessment.durationMinutes,
            questions: questions.map((q) => q.toSummary()),
        };
    }

    async addQuestionsToAssessment(assessmentId: string, questionIds: string[]) {
        const assessment = await this.assessmentPort.findById(assessmentId);
        if (!assessment) throw new NotFoundException('Assessment not found');
        await this.assertQuestionsExist(questionIds);
        await this.assessmentPort.linkQuestions(assessmentId, questionIds);
        return { assessmentId, questionIds };
    }

    private async assertQuestionsExist(questionIds: string[] = []) {
        if (!Array.isArray(questionIds)) throw new BadRequestException('questionIds must be an array');
        const unique = [...new Set(questionIds)];
        if (unique.length === 0) return;
        const found = await this.questionPort.findByIds(unique);
        const foundIds = new Set(found.map((q) => q.id));
        const missing = unique.filter((id) => !foundIds.has(id));
        if (missing.length > 0) throw new BadRequestException(`Questions not found: ${missing.join(', ')}`);
    }

    async getAssesmentResult(assessmentId: string) {
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
    }
}
