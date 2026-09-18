import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

import { AssessmentOrmEntity } from './assessments/infrastructure/persistence/assessment.orm-entity';
import { QuestionOrmEntity } from './assessments/infrastructure/persistence/question.orm-entity';
import { TestCaseOrmEntity } from './assessments/infrastructure/persistence/test-case.orm-entity';
import { AssessmentQuestionOrmEntity } from './assessments/infrastructure/persistence/assessment-question.orm-entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'kata',
  password: process.env.DB_PASSWORD || 'kata123',
  database: process.env.DB_NAME || 'kata_db',
  entities: [AssessmentOrmEntity, QuestionOrmEntity, TestCaseOrmEntity, AssessmentQuestionOrmEntity],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('📡 Conectado a la base de datos');

  const assessmentRepo = dataSource.getRepository(AssessmentOrmEntity);
  const questionRepo = dataSource.getRepository(QuestionOrmEntity);
  const testCaseRepo = dataSource.getRepository(TestCaseOrmEntity);
  const assessmentQuestionRepo = dataSource.getRepository(AssessmentQuestionOrmEntity);

  console.log('🧹 Limpiando datos existentes...');
  await assessmentQuestionRepo.query('TRUNCATE TABLE assessment_questions CASCADE');
  await testCaseRepo.query('TRUNCATE TABLE test_cases CASCADE');
  await questionRepo.query('TRUNCATE TABLE questions CASCADE');
  await assessmentRepo.query('TRUNCATE TABLE assessments CASCADE');

  // ── Preguntas ──────────────────────────────────────────────

  console.log('❓ Creando preguntas...');

  const q1 = await questionRepo.save({
    id: randomUUID(),
    title: 'Máximo de un arreglo',
    description: 'Dado un arreglo de números, retorne el valor máximo.',
    allowedLanguages: ['javascript', 'python', 'java'],
    points: 20,
  });
  await testCaseRepo.save([
    { id: randomUUID(), questionId: q1.id, input: '[3,5,1,8]', expectedOutput: '8', isHidden: false },
    { id: randomUUID(), questionId: q1.id, input: '[1,1,1]', expectedOutput: '1', isHidden: false },
    { id: randomUUID(), questionId: q1.id, input: '[-5,-2,-10]', expectedOutput: '-2', isHidden: true },
  ]);

  const q2 = await questionRepo.save({
    id: randomUUID(),
    title: 'Suma de dos números',
    description: 'Dados dos números enteros separados por espacio en la entrada, retorne su suma.',
    allowedLanguages: ['javascript', 'python', 'java'],
    points: 15,
  });
  await testCaseRepo.save([
    { id: randomUUID(), questionId: q2.id, input: '2 3', expectedOutput: '5', isHidden: false },
    { id: randomUUID(), questionId: q2.id, input: '-1 1', expectedOutput: '0', isHidden: false },
    { id: randomUUID(), questionId: q2.id, input: '100 200', expectedOutput: '300', isHidden: true },
  ]);

  const q3 = await questionRepo.save({
    id: randomUUID(),
    title: 'Palíndromo',
    description: 'Dada una cadena de texto, indique si es palíndromo ("true" o "false").',
    allowedLanguages: ['javascript', 'python'],
    points: 20,
  });
  await testCaseRepo.save([
    { id: randomUUID(), questionId: q3.id, input: 'ana', expectedOutput: 'true', isHidden: false },
    { id: randomUUID(), questionId: q3.id, input: 'hola', expectedOutput: 'false', isHidden: false },
    { id: randomUUID(), questionId: q3.id, input: 'reconocer', expectedOutput: 'true', isHidden: true },
  ]);

  const q4 = await questionRepo.save({
    id: randomUUID(),
    title: 'Fibonacci',
    description: 'Dado un número n, retorne el n-ésimo término de la secuencia de Fibonacci (0-indexado).',
    allowedLanguages: ['javascript', 'python', 'java'],
    points: 25,
  });
  await testCaseRepo.save([
    { id: randomUUID(), questionId: q4.id, input: '0', expectedOutput: '0', isHidden: false },
    { id: randomUUID(), questionId: q4.id, input: '5', expectedOutput: '5', isHidden: false },
    { id: randomUUID(), questionId: q4.id, input: '10', expectedOutput: '55', isHidden: true },
  ]);

  const q5 = await questionRepo.save({
    id: randomUUID(),
    title: 'Contar vocales',
    description: 'Dada una cadena de texto, retorne la cantidad de vocales que contiene.',
    allowedLanguages: ['javascript', 'python', 'java'],
    points: 20,
  });
  await testCaseRepo.save([
    { id: randomUUID(), questionId: q5.id, input: 'programacion', expectedOutput: '6', isHidden: false },
    { id: randomUUID(), questionId: q5.id, input: 'xyz', expectedOutput: '0', isHidden: false },
    { id: randomUUID(), questionId: q5.id, input: 'evaluacion tecnica', expectedOutput: '9', isHidden: true },
  ]);

  // ── Assessments ────────────────────────────────────────────

  console.log('📋 Creando assessments...');

  const assessmentFullStack = await assessmentRepo.save({
    id: randomUUID(),
    name: 'Assessment Full Stack Cloud',
    description: 'Evaluación técnica para perfil Full Stack con enfoque en algoritmos y estructuras básicas.',
    durationMinutes: 60,
  });

  const assessmentJava = await assessmentRepo.save({
    id: randomUUID(),
    name: 'Assessment Java',
    description: 'Evaluación técnica enfocada en lógica de programación con Java.',
    durationMinutes: 45,
  });

  console.log('🔗 Vinculando preguntas a assessments...');

  await assessmentQuestionRepo.save([
    { id: randomUUID(), assessmentId: assessmentFullStack.id, questionId: q1.id, orderIndex: 0 },
    { id: randomUUID(), assessmentId: assessmentFullStack.id, questionId: q2.id, orderIndex: 1 },
    { id: randomUUID(), assessmentId: assessmentFullStack.id, questionId: q3.id, orderIndex: 2 },
    { id: randomUUID(), assessmentId: assessmentFullStack.id, questionId: q4.id, orderIndex: 3 },
    { id: randomUUID(), assessmentId: assessmentFullStack.id, questionId: q5.id, orderIndex: 4 },
  ]);

  await assessmentQuestionRepo.save([
    { id: randomUUID(), assessmentId: assessmentJava.id, questionId: q1.id, orderIndex: 0 },
    { id: randomUUID(), assessmentId: assessmentJava.id, questionId: q4.id, orderIndex: 1 },
  ]);

  console.log('✅ Seed completado');
  console.log(`   Assessment Full Stack Cloud: ${assessmentFullStack.id}`);
  console.log(`   Assessment Java: ${assessmentJava.id}`);
  console.log(`   Preguntas creadas: ${[q1, q2, q3, q4, q5].map((q) => q.id).join(', ')}`);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Error corriendo el seed:', err);
  process.exit(1);
});
