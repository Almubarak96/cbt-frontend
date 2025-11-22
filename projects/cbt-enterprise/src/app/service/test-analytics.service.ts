import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QuestionAnalysis } from '../component/examiner/test-analytics/child/question-performance-table/question-performance-table.component';
import { StudentPerformance } from '../component/examiner/test-analytics/child/student-performance-table/student-performance-table.component';


export interface StudentPerformanceParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
  status?: string;
  dateRange?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface QuestionAnalysisParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  dateRange?: string;
}

// In test-analytics.service.ts
export interface AnalyticsData {
  test: {
    id: number;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    numberOfQuestions: number;
    passingScore: number;
  };
  summary: {
    totalStudents: number;
    completedStudents: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
  };
  scoreDistribution: { score: number; count: number }[];
  questionAnalysis: {
    questionId: number;
    text: string;
    correctAnswers: number;
    incorrectAnswers: number;
    averageTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  timeAnalysis: {
    timeRange: string;
    count: number;
  }[];
  // Remove this line since student performance will be loaded separately
  // studentPerformance: StudentPerformance[];
}

export interface AnalyticsFilters {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestAnalyticsService {

  private apiUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) { }


  exportPdfReport(testId: number, filters?: AnalyticsFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters?.dateRange) {
      params = params.set('dateRange', filters.dateRange);
    }

    return this.http.get(`${this.apiUrl}/tests/${testId}/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  exportExcelReport(testId: number, filters?: AnalyticsFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters?.dateRange) {
      params = params.set('dateRange', filters.dateRange);
    }

    return this.http.get(`${this.apiUrl}/tests/${testId}/export/excel`, {
      params,
      responseType: 'blob'
    });
  }

  exportCsvReport(testId: number, filters?: AnalyticsFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters?.dateRange) {
      params = params.set('dateRange', filters.dateRange);
    }

    return this.http.get(`${this.apiUrl}/tests/${testId}/export/csv`, {
      params,
      responseType: 'blob'
    });
  }

  getTestAnalytics(testId: number, filters?: AnalyticsFilters): Observable<AnalyticsData> {
    let params = new HttpParams();

    if (filters?.dateRange) {
      params = params.set('dateRange', filters.dateRange);
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<AnalyticsData>(`${this.apiUrl}/tests/${testId}`, { params });
  }



  getQuestionAnalysisWithPagination(
    testId: number,
    params: QuestionAnalysisParams
  ): Observable<PaginatedResponse<QuestionAnalysis>> {

    let httpParams = new HttpParams();

    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }
    if (params.dateRange) {
      httpParams = httpParams.set('dateRange', params.dateRange);
    }

    return this.http.get<PaginatedResponse<QuestionAnalysis>>(
      `${this.apiUrl}/tests/${testId}/questions`,
      { params: httpParams }
    );
  }


  getStudentPerformanceWithPagination(
    testId: number,
    params: StudentPerformanceParams
  ): Observable<PaginatedResponse<StudentPerformance>> {

    let httpParams = new HttpParams();

    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.dateRange) {
      httpParams = httpParams.set('dateRange', params.dateRange);
    }

    return this.http.get<PaginatedResponse<StudentPerformance>>(
      `${this.apiUrl}/tests/${testId}/students`,
      { params: httpParams }
    );
  }

  exportAnalyticsReport(testId: number, filters?: AnalyticsFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters?.dateRange) {
      params = params.set('dateRange', filters.dateRange);
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get(`${this.apiUrl}/tests/${testId}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Fallback method if API is not ready
  getMockAnalyticsData(testId: number, filters?: AnalyticsFilters): Observable<AnalyticsData> {
    // Your existing mock data generation logic
    const mockData: AnalyticsData = {
      test: {
        id: testId,
        title: `Mathematics Assessment ${testId}`,
        durationMinutes: 60,
        totalMarks: 100,
        numberOfQuestions: 25,
        passingScore: 70
      },
      summary: {
        totalStudents: 150,
        completedStudents: 142,
        averageScore: 72.5,
        passRate: 68.3,
        averageTimeSpent: 48.2
      },
      scoreDistribution: [
        { score: 0, count: 2 }, { score: 10, count: 1 }, { score: 20, count: 3 },
        { score: 30, count: 5 }, { score: 40, count: 8 }, { score: 50, count: 12 },
        { score: 60, count: 18 }, { score: 70, count: 25 }, { score: 80, count: 32 },
        { score: 90, count: 28 }, { score: 100, count: 8 }
      ],
      questionAnalysis: [
        { questionId: 1, text: 'Solve quadratic equation', correctAnswers: 135, incorrectAnswers: 7, averageTime: 45, difficulty: 'medium' },
        { questionId: 2, text: 'Calculate derivative', correctAnswers: 128, incorrectAnswers: 14, averageTime: 68, difficulty: 'hard' },
        { questionId: 3, text: 'Basic arithmetic', correctAnswers: 142, incorrectAnswers: 0, averageTime: 12, difficulty: 'easy' },
        { questionId: 4, text: 'Geometry problem', correctAnswers: 118, incorrectAnswers: 24, averageTime: 89, difficulty: 'hard' },
        { questionId: 5, text: 'Algebra simplification', correctAnswers: 139, incorrectAnswers: 3, averageTime: 23, difficulty: 'easy' }
      ],
      timeAnalysis: [
        { timeRange: '0-10 min', count: 8 }, { timeRange: '10-20 min', count: 15 },
        { timeRange: '20-30 min', count: 32 }, { timeRange: '30-40 min', count: 45 },
        { timeRange: '40-50 min', count: 28 }, { timeRange: '50-60 min', count: 14 }
      ],
    
    };

    return of(mockData);
  }
}