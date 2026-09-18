import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TestCaseOrmEntity } from './test-case.orm-entity';

@Entity('questions')
export class QuestionOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('simple-array', { name: 'allowed_languages' })
    allowedLanguages: string[];

    @Column()
    points: number;

    @OneToMany(() => TestCaseOrmEntity, (tc) => tc.question)
    testCases: TestCaseOrmEntity[];
}
