import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QuestionRepositoryPort } from '../../domain/ports/question.repository.port';
import { Question, SupportedLanguage } from '../../domain/entities/question.entity';
import { QuestionOrmEntity } from './question.orm-entity';

@Injectable()
export class QuestionPostgresRepository implements QuestionRepositoryPort {
    constructor(
        @InjectRepository(QuestionOrmEntity)
        private readonly repo: Repository<QuestionOrmEntity>,
    ) { }

    private toDomain(row: QuestionOrmEntity): Question {
        return new Question(
            row.id,
            row.title,
            row.description,
            row.allowedLanguages as SupportedLanguage[],
            row.points,
            row.testCases?.map((tc) => tc.id) ?? [],
        );
    }

    async save(question: Question): Promise<Question> {
        const saved = await this.repo.save({
            id: question.id,
            title: question.title,
            description: question.description,
            allowedLanguages: question.allowedLanguages,
            points: question.points,
        });
        return this.toDomain(saved);
    }

    async findById(id: string): Promise<Question | null> {
        const row = await this.repo.findOne({ where: { id }, relations: { testCases: true } });
        return row ? this.toDomain(row) : null;
    }

    async findAll(): Promise<Question[]> {
        const rows = await this.repo.find({ relations: { testCases: true } });
        return rows.map((r) => this.toDomain(r));
    }

    async findByIds(ids: string[]): Promise<Question[]> {
        const rows = await this.repo.find({ where: { id: In(ids) }, relations: { testCases: true } });
        return rows.map((r) => this.toDomain(r));
    }
}