# 🚀 Kata FullStack — Technical Assessment Platform

Plataforma de evaluación técnica que permite crear assessments, registrar preguntas de programación con casos de prueba, resolver ejercicios y calificar automáticamente el código enviado por el candidato.

## 🛠️ Stack

| Capa | Tecnología |
|---|---|
| 🔧 Backend | NestJS (Node.js 24) |
| 🎨 Frontend | Angular 21 |
| 🗄️ Base de datos | PostgreSQL 16 |
| 🐳 Ejecución de código | Docker |

## 🏗️ Arquitectura

Backend implementado con **arquitectura hexagonal (ports & adapters)**:

```
src/
  <dominio>/
    domain/
      entities/        → clases puras, sin decoradores de framework
      ports/            → interfaces (contratos) que el dominio expone
    application/
      use-cases/        → orquestan lógica de negocio usando los puertos
    infrastructure/
      persistence/      → entidades ORM + repositorios (implementan los puertos)
      controller/        → controladores HTTP (adaptadores de entrada)
      execution/          → adapter de ejecución de código (Docker)
```

Módulos independientes: `assessments`, `questions`, `submissions`, `execution`. El dominio no conoce TypeORM ni Nest — solo interfaces (`*.repository.port.ts`, `code-executor.port.ts`).

## 🗂️ Modelo de datos

- 📋 **assessments**: evaluaciones técnicas (nombre, descripción, duración)
- ❓ **questions**: ejercicios de programación (título, descripción, lenguajes permitidos, puntaje)
- ✅ **test_cases**: casos de prueba de cada pregunta (input, output esperado, visible/oculto)
- 🔗 **assessment_questions**: relación N:N — qué preguntas componen cada assessment, con orden
- 📤 **submissions**: respuestas del candidato (código, lenguaje, resultados por test case, score, jsonb)

## ⚙️ Requisitos previos

- Node.js 24
- Docker Desktop (para Postgres y para el motor de ejecución de código)

## ▶️ Cómo correr el proyecto

### 1️⃣ Base de datos

```bash
docker compose up -d
```

Levanta Postgres en el puerto configurado (`5433` por defecto si `5432` ya estaba ocupado localmente — ver `docker-compose.yml`).

### 2️⃣ Backend

```bash
cd kata-backend
npm install
npm run start:dev
```

Variables de entorno (`.env`):
```
DB_HOST=localhost
DB_PORT=5433
DB_USER=kata
DB_PASSWORD=******
DB_NAME=kata_db
```

`synchronize: true` está activo en desarrollo — las tablas se crean automáticamente desde las entidades ORM al levantar el backend.

### 3️⃣ Imágenes Docker del motor de ejecución (opcional, pre-descarga)

```bash
docker pull node:24-alpine
docker pull python:3.12-alpine
docker pull eclipse-temurin:21-jdk-alpine
```

Si no se pre-descargan, se descargan automáticamente en el primer uso de cada lenguaje.


### 4️⃣ Seed de datos de ejemplo (opcional)

Ejecuta (con Postgres levantado y las tablas ya creadas — corre el backend una vez con `npm run start:dev` antes):
```bash
npm run seed
```

Esto crea 2 assessments, 5 preguntas con test cases (incluyendo casos ocultos) y las vincula entre sí, listo para probar el flujo completo desde Postman o el frontend.

### 5️⃣ Frontend

```bash
cd kata-frontend
npm install
npm start
```

## 🌐 Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| 🟢 POST | `/assessments` | Crea un assessment (opcionalmente con `questionIds`) |
| 🔵 GET | `/assessments` | Lista assessments |
| 🔵 GET | `/assessments/:id` | Detalle de un assessment con sus preguntas |
| 🟢 POST | `/assessments/:id/questions` | Vincula preguntas existentes a un assessment |
| 🔵 GET | `/assessments/:id/results` | Resultados agregados del assessment |
| 🟢 POST | `/questions` | Crea una pregunta con sus test cases |
| 🔵 GET | `/questions` | Lista preguntas |
| 🔵 GET | `/questions/:id` | Detalle de una pregunta |
| 🟢 POST | `/run` | Ejecuta código libremente, sin calificar |
| 🟢 POST | `/submissions` | Envía respuesta de una pregunta y la califica |
| 🔵 GET | `/submissions/:id` | Detalle de una submission |

## 🐳 Motor de ejecución de código

Cada envío de código corre en un **contenedor Docker efímero y aislado**, uno por lenguaje soportado (☕ Java, 🟨 JavaScript, 🐍 Python; TypeScript: 🔷). El flujo:

1. 📝 El código y el input del test case se escriben en un directorio temporal del host
2. 📦 Se levanta un contenedor con ese directorio montado como solo lectura
3. ⏱️ Se ejecuta con timeout; si excede el límite, el contenedor se mata
4. 🧹 Se captura `stdout`/`stderr`/`exitCode`, se parsea si hubo error de compilación (línea + mensaje), y se limpia todo (contenedor + archivos temporales)

### 🔒 Controles de seguridad implementados

| Control | Mecanismo |
|---|---|
| 🧱 Aislamiento de ejecución | Contenedor Docker efímero (`--rm`) por cada ejecución, filesystem `--read-only` |
| 🚫 Restricciones de acceso | `--network none` — sin acceso a red/internet desde el código ejecutado |
| 🛡️ Manejo seguro de entradas | Input pasado por stdin (no interpolado en shell), errores de parseo capturados sin afectar el proceso principal |
| ☠️ Prevención de ejecución maliciosa | `--pids-limit=64` (previene fork bombs), sin acceso a variables de entorno del host |
| 📊 Control de consumo de recursos | `--memory=128m`, `--cpus=0.5`, timeout de 8s con `docker kill` forzado |

## 🏆 Calificación automática

Por cada `submission`, se ejecutan todos los test cases de la pregunta correspondiente, comparando `stdout` contra el `expectedOutput` de cada uno. El score se calcula proporcionalmente a los casos exitosos sobre el total, ponderado por los puntos de la pregunta.

## ☁️ Despliegue en AWS (no implementado — diseño propuesto)

| Componente | Servicio AWS |
|---|---|
| 🔧 Backend (NestJS) | ECS Fargate |
| 🎨 Frontend (Angular) | S3 + CloudFront |
| 🗄️ Base de datos | RDS PostgreSQL (Multi-AZ) |
| 🐳 Motor de ejecución | Tareas Fargate efímeras por ejecución, o Lambda + Firecracker para mayor aislamiento |
| 🔑 Secrets (credenciales DB) | AWS Secrets Manager |
| 📜 Logs | CloudWatch Logs |

Modelo de datos relacional

## 🔐 Seguridad del repositorio

- 🧪 Datos de prueba simulados en todos los ejemplos y seeds
