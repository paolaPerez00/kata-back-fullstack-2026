import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuestionOrmEntity } from '../../../assessments/infrastructure/persistence/question.orm-entity';

@Entity('test_cases')
export class TestCaseOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    input: string;

    @Column('text', { name: 'expected_output' })
    expectedOutput: string;

    @Column({ name: 'is_hidden', default: false })
    isHidden: boolean;

    @ManyToOne(() => QuestionOrmEntity, (q) => q.testCases, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: QuestionOrmEntity;

    @Column({ name: 'question_id' })
    questionId: string;
}
