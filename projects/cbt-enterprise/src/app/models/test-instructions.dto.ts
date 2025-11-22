
export interface TestInstructionsModel {
  testId: number;
  examName: string;
  instructions: string[];
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  showResultsImmediately: boolean;
  readBy?: string[];
}

export interface InstructionTemplate {
  id: number;
  name: string;
  instructions: string[];
  description: string;
}