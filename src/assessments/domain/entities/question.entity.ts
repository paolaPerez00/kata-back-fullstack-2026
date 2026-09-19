export type SupportedLanguage = 'java' | 'javascript' | 'python' | 'typescript' | 'cobol';

export class Question {
    constructor(
        public readonly id: string,
        public title: string,
        public description: string,
        public allowedLanguages: SupportedLanguage[],
        public points: number,
        public testCaseIds: string[] = [],
    ) { }

    toSummary() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            allowedLanguages: this.allowedLanguages,
            points: this.points,
        };
    }
}

export interface TestCaseInput {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

export interface QuestionBody {
    title: string,
    description: string,
    allowedLanguages: SupportedLanguage[],
    points: number,
    testCases: TestCaseInput[],
}