import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AssessmentOrmEntity } from './assessment.orm-entity';
import { QuestionOrmEntity } from './question.orm-entity';

@Entity('assessment_questions')
export class AssessmentQuestionOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'assessment_id' })
    assessmentId: string;

    @Column({ name: 'question_id' })
    questionId: string;

    @Column({ name: 'order_index', default: 0 })
    orderIndex: number;

    @ManyToOne(() => AssessmentOrmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assessment_id' })
    assessment: AssessmentOrmEntity;

    @ManyToOne(() => QuestionOrmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question: QuestionOrmEntity;
}