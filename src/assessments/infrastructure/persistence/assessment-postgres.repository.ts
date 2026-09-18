import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentRepositoryPort } from '../../domain/ports/assessment.repository.port';
import { Assessment } from '../../domain/entities/assessment.entity';
import { AssessmentOrmEntity } from './assessment.orm-entity';

@Injectable()
export class AssessmentPostgresRepository implements AssessmentRepositoryPort {
    constructor(
        @InjectRepository(AssessmentOrmEntity)
        private readonly repo: Repository<AssessmentOrmEntity>,
    ) { }

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
