export type SubmissionStatus = 'pending' | 'graded' | 'error';

export interface TestCaseResult {
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    errorMessage?: string;
}

export class Submission {
    constructor(
        public readonly id: string,
        public readonly questionId: string,
        public readonly assessmentId: string,
        public code: string,
        public language: string,
        public status: SubmissionStatus = 'pending',
        public score: number = 0,
        public results: TestCaseResult[] = [],
        public readonly submittedAt: Date = new Date(),
    ) { }

    grade(results: TestCaseResult[], pointsPerQuestion: number) {
        this.results = results;
        const passedCount = results.filter((r) => r.passed).length;
        this.score = results.length > 0 ? (passedCount / results.length) * pointsPerQuestion : 0;
        this.status = 'graded';
    }

    get summary() {
        const total = this.results.length;
        const passed = this.results.filter((r) => r.passed).length;
        return {
            totalCases: total,
            passedCases: passed,
            failedCases: total - passed,
            percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
        };
    }
}
