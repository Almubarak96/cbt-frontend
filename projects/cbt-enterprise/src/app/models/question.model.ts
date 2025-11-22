export interface QuestionModel{
    matchingPairs : { left: string; right: string }[];
    id?: number;
    text? : string;
    choices: string;
    correctAnswer: string;
    type?: string;
    maxMarks?:string;
    test_id_id?: string;
    explanation?: string;
}