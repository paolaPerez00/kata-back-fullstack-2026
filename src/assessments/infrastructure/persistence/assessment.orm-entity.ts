import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('assessments')
export class AssessmentOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ name: 'duration_minutes' })
    durationMinutes: number;
}
