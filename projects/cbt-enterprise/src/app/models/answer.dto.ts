export interface AnswerDTO {
  /**The is  id of a single questions assigned to a student*/
  studentExamQuestionId: any;

  /* The question id, should be same with returned from backend */
  questionId: number;

  /**One of the options choosen as  answer if its MCQ, MSQ choosen  
  * or the ansered typed if its an Fill in the blank or Essay
  */
  answer: string;


}