import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, retry } from 'rxjs/operators';

export interface DashboardStats {
  totalTests: number;
  totalStudents: number;
  totalExaminers: number;
  activeTests: number;
  completedExams: number;
  averageScore: number;
  passRate: number;
  enrollmentRate: number;
  pendingGrading: number;
  totalQuestions: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageTimeSpent: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  description?: string;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface ActivityData {
  type: string;
  description: string;
  time: string;
  icon: string;
  metadata?: any;
}

export interface PlatformOverview {
  testsByStatus: ChartData[];
  studentPerformance: ChartData[];
  questionDistribution: ChartData[];
  enrollmentTrends: TrendData[];
  recentActivity: ActivityData[];
  topPerformers: any[];
  testPerformance: any[];
  scoreDistribution: ChartData[];
  timeSpentAnalysis: ChartData[];
  departmentDistribution: ChartData[];
}

export interface AnalyticsData {
  scoreDistribution: ChartData[];
  timeAnalysis: ChartData[];
  questionAnalysis: any[];
  studentPerformance: any[];
}

export interface ExaminerDashboardData {
  myTests: number;
  myPublishedTests: number;
  myStudents: number;
  totalEnrollments: number;
  activeEnrollments: number;
  recentActivity: ActivityData[];
  performanceMetrics: {
    averageScore: number;
    completionRate: number;
    passRate: number;
    totalEnrollments: number;
    completedExams: number;
  };
}












@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';
  private cache = new Map<string, any>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get overall platform statistics
  getDashboardStats(dateRange?: string): Observable<DashboardStats> {
    this.loadingSubject.next(true);
    let params = new HttpParams();
    if (dateRange) {
      params = params.set('dateRange', dateRange);
    }
    
    const cacheKey = `stats_${dateRange || 'all'}`;
    if (this.cache.has(cacheKey)) {
      this.loadingSubject.next(false);
      return new Observable(observer => {
        observer.next(this.cache.get(cacheKey));
        observer.complete();
      });
    }

    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { params })
      .pipe(
        retry(2),
        tap(data => {
          this.cache.set(cacheKey, data);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  // Get comprehensive platform overview
  getPlatformOverview(dateRange?: string): Observable<PlatformOverview> {
    this.loadingSubject.next(true);
    let params = new HttpParams();
    if (dateRange) {
      params = params.set('dateRange', dateRange);
    }
    
    const cacheKey = `overview_${dateRange || 'all'}`;
    if (this.cache.has(cacheKey)) {
      this.loadingSubject.next(false);
      return new Observable(observer => {
        observer.next(this.cache.get(cacheKey));
        observer.complete();
      });
    }

    return this.http.get<PlatformOverview>(`${this.apiUrl}/overview`, { params })
      .pipe(
        retry(2),
        tap(data => {
          this.cache.set(cacheKey, data);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  // Get detailed analytics for charts
  getAnalyticsData(testId?: number, dateRange?: string): Observable<AnalyticsData> {
    let params = new HttpParams();
    if (testId) {
      params = params.set('testId', testId.toString());
    }
    if (dateRange) {
      params = params.set('dateRange', dateRange);
    }
    return this.http.get<AnalyticsData>(`${this.apiUrl}/analytics`, { params })
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Get examiner-specific dashboard data
  getExaminerDashboard(): Observable<ExaminerDashboardData> {
    this.loadingSubject.next(true);
    return this.http.get<ExaminerDashboardData>(`${this.apiUrl}/examiner`)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError)
      );
  }

  // Get real-time activity feed
  getRecentActivity(limit: number = 10): Observable<ActivityData[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ActivityData[]>(`${this.apiUrl}/activity`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Export dashboard data
  exportDashboardReport(format: 'pdf' | 'excel' | 'csv', dateRange?: string): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (dateRange) {
      params = params.set('dateRange', dateRange);
    }
    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Refresh all data
  refreshAll(): void {
    this.clearCache();
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('Dashboard Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }





  
}