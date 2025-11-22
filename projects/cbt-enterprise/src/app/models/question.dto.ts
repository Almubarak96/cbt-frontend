
export enum MediaType {
  NONE = 'NONE',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO'
}


export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  TRUE_FALSE = 'TRUE_FALSE',
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING'
}

export interface QuestionDTO {

  /***The id of the question */
  questionId: number;

  /***The text of the question */
  text: string;

  /***The Question type e,g MCQ, MSQ, FILL_IN_THE_BLANK etc */
  type: QuestionType,

  /**options of of single question this only used in MCQ and MSQ
   * comes in form like this
   */
  choices: string;

  /**Id the of a single question assigned to a particular student */
  studentExamQuestionId: number;

  /**The options or answered choosen by the student save to databse */
  savedAnswer: string


  // Multimedia fields
  mediaType?: MediaType;
  mediaPath?: string;
  mediaCaption?: string;
}