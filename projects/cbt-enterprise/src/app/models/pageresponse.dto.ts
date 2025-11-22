import { QuestionDTO } from "./question.dto";

export interface PageResponse {

  /**All the contents in a Question as returned from the backend examples are 
   * The question text, choices, id  of the question, the question type may be MCQ, MSQ, FILL 
   * Fill in the blank  etc
   */
  content: QuestionDTO[];

  /**Total pages*/
  totalPages: number;

  /**The current page number if*/
  pageNumber: number;
}