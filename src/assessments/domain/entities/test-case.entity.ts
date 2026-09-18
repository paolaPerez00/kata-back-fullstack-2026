export class TestCase {
    constructor(
        public readonly id: string,
        public readonly questionId: string,
        public input: string,
        public expectedOutput: string,
        public isHidden: boolean = false,
    ) { }
}
