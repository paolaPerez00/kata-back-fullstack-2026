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