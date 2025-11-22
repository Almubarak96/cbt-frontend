import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionModel } from '../models/question.model';
import { TestModel } from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class ExaminerService {


  private api = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  getTests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/tests`);
  }

  /***Get a Test by it Id */
  getTestById(testId: number): Observable<TestModel> {
    return this.http.get<TestModel>(`${this.api}/tests/${testId}`);
  }

  /***Create a new test */
  createTest(test: any): Observable<any> {
    return this.http.post(`${this.api}/tests`, test);
  }

  /** Update an existing test */
  updateTest(id: number, test: TestModel): Observable<TestModel> {
    return this.http.put<TestModel>(`${this.api}/tests/${id}`, test);
  }

  /***Add a question to a test */
  addQuestion(testId: number, question: QuestionModel): Observable<QuestionModel> {
    return this.http.post<QuestionModel>(`${this.api}/tests/${testId}/questions/new`, question);
  }

  /**
 * Adds a question with media file support
 */
  addQuestionWithMedia(testId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.api}/tests/${testId}/questions/new`, formData);
  }



  /**
   * Updates a question with media file support
   */
  updateQuestionWithMedia(testId: number, questionId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.api}/tests/${testId}/questions/${questionId}`, formData);
  }

  /** Get a question by its ID within a test */
  getQuestion(testId: number, questionId: number): Observable<QuestionModel> {
    return this.http.get<QuestionModel>(`${this.api}/tests/${testId}/questions/${questionId}`);
  }


  getQuestionsByTest(testId: number): Observable<QuestionModel[]> {
    return this.http.get<QuestionModel[]>(`${this.api}/tests/${testId}/questions`);
  }

  /** Update an existing question for a test */
  updateQuestion(testId: number, questionId: number, question: QuestionModel): Observable<QuestionModel> {
    return this.http.put<QuestionModel>(`${this.api}/tests/${testId}/questions/${questionId}`, question);
  }

  assignToGroup(testId: number, groupId: number): Observable<any> {
    return this.http.post(`${this.api}/assignments/group/${testId}/${groupId}`, {});
  }

  assignToStudent(testId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.api}/assignments/student/${testId}/${studentId}`, {});
  }



  // Upload file for test
  uploadTest(file: File): Observable<string> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http.post(this.api + "/tests/upload", formData, {
      responseType: 'text' // backend returns plain text
    });
  }

  // Download template for test
  downloadTemplate(format: 'excel' | 'csv'): Observable<Blob> {
    const url = `${this.api}/tests/download-template?format=${format}`;
    return this.http.get(url, { responseType: 'blob' });
  }



  // Upload questions for a specific test
  uploadQuestions(testId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.api}/tests/${testId}/questions/upload`, formData, {
      responseType: 'text'
    });
  }

  // Download question template 
  downloadQuestionTemplate(format: 'excel' | 'csv', testId: number): Observable<Blob> {
    const url = `${this.api}/tests/${testId}/questions/download-question-template?format=${format}`;
    return this.http.get(url, { responseType: 'blob' });
    //
  }



  getTestsPaginated(page: number = 0, size: number = 10, sort: string = 'id,desc'): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sort: sort
    };
    return this.http.get('http://localhost:8080/api/admin/tests/all', { params });
  }

  searchTests(k: string, page: number = 0, size: number = 10, sort: string = 'title,asc'): Observable<any> {
    const params = {
      keyword: k,
      page: page.toString(),
      size: size.toString(),
      sort: sort
    };
    return this.http.get('http://localhost:8080/api/admin/tests/search', { params });
  }

  getTestsByStatus(published: boolean, page: number = 0, size: number = 10, sort: string = 'title,asc'): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sort: sort
    };
    return this.http.get(`http://localhost:8080/api/admin/tests/status/${published}`, { params });
  }












  // Add to your ExaminerService
  getQuestionsPaginated(
    testId: number,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDirection: string = 'desc',
    keyword?: string,
    type?: string,
    minMarks?: number,
    maxMarks?: number
  ): Observable<any> {
    let url = `http://localhost:8080/api/admin/tests/${testId}/questions/advanced-search?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`;

    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    if (minMarks !== undefined) {
      url += `&minMarks=${minMarks}`;
    }
    if (maxMarks !== undefined) {
      url += `&maxMarks=${maxMarks}`;
    }

    return this.http.get<any>(url);
  }

  // Optional: Individual endpoint methods
  searchQuestions(testId: number, keyword: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/admin/tests/${testId}/questions/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  }

  getQuestionsByType(testId: number, type: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/admin/tests/${testId}/questions/type/${type}?page=${page}&size=${size}`);
  }

}
