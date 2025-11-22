
export interface TestModel {
    id : number;
    title: string;
    numberOfQuestions?: number;
    randomizeQuestions?: boolean;
    shuffleChoices?:boolean;
    description? : string;
    durationMinutes?: number;
    totalMarks? : null;
    published?: boolean;
}