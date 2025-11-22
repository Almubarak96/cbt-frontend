import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ManualGradingRequest {
  sessionId: number;
  questionId: number;
  score: number;
  feedback?: string;
  graderId: number;
}

export interface EssayGradingResponse {
  sessionId: number;
  questionId: number;
  awardedScore: number;
  maxMarks: number;
  feedback?: string;
  gradedAt: string;
  graderName?: string;
  success: boolean;
  message: string;
}

export interface StudentEssayAnswer {
  sessionId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  questionId: number;
  questionText: string;
  essayAnswer: string;
  maxMarks: number;
  currentScore?: number;
  graderFeedback?: string;
  submittedAt: string;
  graded: boolean;
  gradedAt?: string;
}

export interface EssayGradingStats {
  gradedEssays: number;
  ungradedEssays: number;
  totalEssays: number;
}



export interface StudentEssayGroup {
  studentId: number;
  studentName: string;
  studentEmail: string;
  essays: StudentEssayAnswer[];
  gradedCount: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ManualGradingService {
  private apiUrl = 'http://localhost:8080/api/grading';

  constructor(private http: HttpClient) { }

  gradeEssay(request: ManualGradingRequest): Observable<EssayGradingResponse> {
    return this.http.post<EssayGradingResponse>(`${this.apiUrl}/essay`, request);
  }

  getUngradedEssays(testId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/tests/${testId}/essays/ungraded`, { params });
  }

  getAllEssays(testId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/tests/${testId}/essays`, { params });
  }

  getEssayAnswer(sessionId: number, questionId: number): Observable<StudentEssayAnswer> {
    return this.http.get<StudentEssayAnswer>(
      `${this.apiUrl}/sessions/${sessionId}/questions/${questionId}/essay`
    );
  }

  getGradingStats(testId: number): Observable<EssayGradingStats> {
    return this.http.get<EssayGradingStats>(`${this.apiUrl}/tests/${testId}/essays/stats`);
  }


  // Add to ManualGradingService
  getEssaysGroupedByStudent(testId: number): Observable<StudentEssayGroup[]> {
    return this.http.get<StudentEssayGroup[]>(`${this.apiUrl}/tests/${testId}/essays/grouped`);
  }

  getExamGradingStatus(sessionId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sessions/${sessionId}/grading-status`);
  }

  areAllEssaysGraded(sessionId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/sessions/${sessionId}/essays-graded`);
  }



//   // Add to ManualGradingService
// getEssaysGroupedByStudent(testId: number, page: number = 0, size: number = 10): Observable<any> {
//   const params = new HttpParams()
//     .set('page', page.toString())
//     .set('size', size.toString());

//   return this.http.get<any>(`${this.apiUrl}/tests/${testId}/essays/grouped`, { params });
// }

}