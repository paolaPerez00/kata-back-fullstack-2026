import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { TestCaseResult, type SubmissionStatus } from '../../domain/entities/submission.entity';

@Entity('submissions')
export class SubmissionOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'question_id' })
    questionId: string;

    @Column({ name: 'assessment_id' })
    assessmentId: string;

    @Column('text')
    code: string;

    @Column()
    language: string;

    @Column({ default: 'pending' })
    status: SubmissionStatus;

    @Column('float', { default: 0 })
    score: number;

    @Column('jsonb', { default: [] })
    results: TestCaseResult[];

    @CreateDateColumn({ name: 'submitted_at' })
    submittedAt: Date;
}
