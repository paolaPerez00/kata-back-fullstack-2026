import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentRepositoryPort } from '../../domain/ports/assessment.repository.port';
import { Assessment } from '../../domain/entities/assessment.entity';
import { AssessmentOrmEntity } from './assessment.orm-entity';
import { AssessmentQuestionOrmEntity } from './assessment-question.orm-entity';

@Injectable()
export class AssessmentPostgresRepository implements AssessmentRepositoryPort {
    constructor(
        @InjectRepository(AssessmentOrmEntity)
        private readonly repo: Repository<AssessmentOrmEntity>,
        @InjectRepository(AssessmentQuestionOrmEntity)
        private readonly linkRepo: Repository<AssessmentQuestionOrmEntity>,
    ) { }
    async linkQuestions(assessmentId: string, questionIds: string[]): Promise<void> {
        const existing = await this.findQuestionIdsByAssessment(assessmentId);
        const known = new Set(existing);
        const newIds = [...new Set(questionIds)].filter((id) => !known.has(id));

        const rows = newIds.map((questionId, index) => ({
            assessmentId,
            questionId,
            orderIndex: existing.length + index,
        }));
        if (rows.length > 0) await this.linkRepo.save(rows);
    }

    async findQuestionIdsByAssessment(assessmentId: string): Promise<string[]> {
        const rows = await this.linkRepo.find({
            where: { assessmentId },
            order: { orderIndex: 'ASC' },
        });
        return rows.map((r) => r.questionId);
    }

    async save(assessment: Assessment): Promise<Assessment> {
        const saved = await this.repo.save(assessment);
        return new Assessment(saved.id, saved.name, saved.description, saved.durationMinutes);
    }

    async findById(id: string): Promise<Assessment | null> {
        const row = await this.repo.findOneBy({ id });
        if (!row) return null;
        return new Assessment(row.id, row.name, row.description, row.durationMinutes);
    }

    async findAll(): Promise<Assessment[]> {
        const rows = await this.repo.find();
        return rows.map(r => new Assessment(r.id, r.name, r.description, r.durationMinutes));
    }
}
