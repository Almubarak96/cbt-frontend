// results.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestResultSummary {
  testId: number;
  testTitle: string;
  totalStudents: number;
  completedStudents: number;
  gradedStudents: number;
  averageScore: number;
  passRate: number;
  durationMinutes: number;
  totalMarks: number;
  passingScore: number;
  published: boolean;
  //createdAt: string;
}

export interface StudentExamResult {
totalMarks: any;
  sessionId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  score: number;
  percentage: number;
  timeSpent: number;
  status: string;
  graded: boolean;
  completed: boolean;
  startTime: string;
  endTime: string;
  grade: string;
  passed: boolean;
}

export interface StudentDetailedResult {
passingScore: any;
  sessionId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  testTitle: string;
  score: number;
  percentage: number;
  totalMarks: number;
  timeSpent: number;
  grade: string;
  passed: boolean;
  startTime: string;
  endTime: string;
  status: string;
}

export interface ResultsResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private apiUrl = 'http://localhost:8080/api/results';

  constructor(private http: HttpClient) {}

  getTestResults(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'title',
    sortDirection: string = 'desc',
    search?: string,
    status?: string
  ): Observable<ResultsResponse<TestResultSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.http.get<ResultsResponse<TestResultSummary>>(`${this.apiUrl}/tests`, { params });
  }

  getStudentResults(
    testId: number,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'percentage',
    sortDirection: string = 'desc',
    search?: string,
    minScore?: number,
    maxScore?: number,
    status?: string,
    graded?: boolean
  ): Observable<ResultsResponse<StudentExamResult>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (search) params = params.set('search', search);
    if (minScore !== undefined) params = params.set('minScore', minScore.toString());
    if (maxScore !== undefined) params = params.set('maxScore', maxScore.toString());
    if (status) params = params.set('status', status);
    if (graded !== undefined) params = params.set('graded', graded.toString());

    return this.http.get<ResultsResponse<StudentExamResult>>(
      `${this.apiUrl}/tests/${testId}/students`, 
      { params }
    );
  }

  getStudentDetailedResult(sessionId: number): Observable<StudentDetailedResult> {
    return this.http.get<StudentDetailedResult>(`${this.apiUrl}/students/${sessionId}`);
  }

  exportResults(testId: number, format: 'csv' | 'pdf' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tests/${testId}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }
}