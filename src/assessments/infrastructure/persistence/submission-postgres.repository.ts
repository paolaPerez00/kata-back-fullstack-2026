import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionRepositoryPort } from '../../domain/ports/submission.repository.port';
import { Submission } from '../../domain/entities/submission.entity';
import { SubmissionOrmEntity } from './submission.orm-entity';

@Injectable()
export class SubmissionPostgresRepository implements SubmissionRepositoryPort {
    constructor(
        @InjectRepository(SubmissionOrmEntity)
        private readonly repo: Repository<SubmissionOrmEntity>,
    ) { }

    private toDomain(row: SubmissionOrmEntity): Submission {
        const s = new Submission(
            row.id,
            row.questionId,
            row.assessmentId,
            row.code,
            row.language,
            row.status,
            row.score,
            row.results,
            row.submittedAt,
        );
        return s;
    }

    async save(submission: Submission): Promise<Submission> {
        const saved = await this.repo.save({
            id: submission.id,
            questionId: submission.questionId,
            assessmentId: submission.assessmentId,
            code: submission.code,
            language: submission.language,
            status: submission.status,
            score: submission.score,
            results: submission.results,
        });
        return this.toDomain(saved);
    }

    async findById(id: string): Promise<Submission | null> {
        const row = await this.repo.findOneBy({ id });
        return row ? this.toDomain(row) : null;
    }

    async findByAssessmentId(assessmentId: string): Promise<Submission[]> {
        const rows = await this.repo.find({ where: { assessmentId } });
        return rows.map((r) => this.toDomain(r));
    }
}
