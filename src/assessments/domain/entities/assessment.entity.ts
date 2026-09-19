export class Assessment {
    constructor(
        public readonly id: string,
        public name: string,
        public description: string,
        public durationMinutes: number,
    ) { }
}