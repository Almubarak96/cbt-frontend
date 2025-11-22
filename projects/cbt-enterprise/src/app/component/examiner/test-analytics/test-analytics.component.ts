

// test-analytics.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { StudentPerformanceTableComponent } from './child/student-performance-table/student-performance-table.component';
import { AnalyticsExportButtonComponent } from './child/analytics-export-button/analytics-export-button.component';
import { ErrorStateComponent } from './child/error-state/error-state.component';
import { LoadingStateComponent } from './child/loading-state/loading-state.component';
import { AnalyticsMetricsCardComponent } from './child/analytics-metrics-card/analytics-metrics-card.component';
import { ScoreDistributionChartComponent } from './child/score-distribution-chart/score-distribution-chart.component';
import { TimeAnalysisChartComponent } from './child/time-analysis-chart/time-analysis-chart.component';
import { QuestionPerformanceTableComponent } from './child/question-performance-table/question-performance-table.component';
import { AnalyticsData, AnalyticsFilters, TestAnalyticsService } from '../../../service/test-analytics.service';
import { ExportService } from '../../../service/export.service';
import { WebSocketService } from '../../../service/websocket.service';




// Types
export interface DateRangeOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-test-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AnalyticsMetricsCardComponent,
    ScoreDistributionChartComponent,
    TimeAnalysisChartComponent,
    QuestionPerformanceTableComponent,
    StudentPerformanceTableComponent,
    AnalyticsExportButtonComponent,
    LoadingStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './test-analytics.component.html',
  styleUrls: ['./test-analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analyticsService = inject(TestAnalyticsService);
  private websocketService = inject(WebSocketService);
  private exportService = inject(ExportService);

  private destroy$ = new Subject<void>();
  private filterSubject = new Subject<AnalyticsFilters>();

  // Component State
  testId!: number;
  analyticsData: AnalyticsData | null = null;
  isLoading = false;
  isRefreshing = false;
  errorMessage = '';
  successMessage = '';

  // Filters
  dateRange = 'all';
  dateRangeOptions: DateRangeOption[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  // Chart visibility
  showCharts = true;

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.testId) {
      this.errorMessage = 'Invalid test ID';
      return;
    }

    this.setupFilterSubscription();
    this.loadAnalytics();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnectWebSocket();
  }

  private setupFilterSubscription(): void {
    this.filterSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
      ),
      switchMap(filters => this.loadAnalyticsData(filters)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private loadAnalyticsData(filters: AnalyticsFilters) {
    this.isLoading = true;
    this.errorMessage = '';

    return this.analyticsService.getTestAnalytics(this.testId, filters).pipe(
      catchError(error => {
        console.warn('API not available, using mock data:', error);
        return this.analyticsService.getMockAnalyticsData(this.testId, filters);
      }),
      catchError(error => {
        this.errorMessage = 'Failed to load analytics data. Please try again.';
        this.isLoading = false;
        console.error('Error loading analytics:', error);
        return of(null);
      })
    );
  }

  loadAnalytics(): void {
    const filters = this.getFilters();
    this.loadAnalyticsData(filters).subscribe({
      next: (data) => {
        if (data) {
          this.analyticsData = data;
          this.isLoading = false;
          this.isRefreshing = false;
        }
      }
    });
  }

  refreshData(): void {
    this.isRefreshing = true;
    this.loadAnalytics();
  }

  onDateRangeChange(): void {
    this.filterSubject.next(this.getFilters());
  }

  toggleCharts(): void {
    this.showCharts = !this.showCharts;
  }

  public getFilters(): AnalyticsFilters {
    return {
      dateRange: this.dateRange,
    //  testId: this.testId
    };
  }

  // WebSocket Handling
  private connectWebSocket(): void {
    this.websocketService.connect(`/topic/analytics/${this.testId}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (message) => this.handleWebSocketMessage(message),
      error: (error) => console.error('WebSocket error:', error)
    });
  }

  private disconnectWebSocket(): void {
    this.websocketService.disconnect();
  }

  private handleWebSocketMessage(message: any): void {
    if (message?.type === 'ANALYTICS_UPDATE' && message.data) {
      this.analyticsData = { ...this.analyticsData, ...message.data };
      this.successMessage = 'Analytics data updated in real-time';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  // Export Handling
  onExportRequested(format: string): void {
    if (!this.analyticsData) return;

    const filters = this.getFilters();
    const exportData = {
      analytics: this.analyticsData,
      filters,
      exportedAt: new Date().toISOString()
    };

    this.exportService.exportAnalytics(exportData, format).subscribe({
      next: (blob) => {
        this.downloadFile(blob, this.generateExportFilename(format));
        this.successMessage = `${format.toUpperCase()} report exported successfully!`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = `Failed to export ${format} report`;
        console.error('Export error:', error);
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  private generateExportFilename(format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const testTitle = this.analyticsData?.test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'test';
    return `analytics_${testTitle}_${timestamp}.${format}`;
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // UI Helpers
  getCompletionRate(): number {
    if (!this.analyticsData?.summary) return 0;
    const { completedStudents, totalStudents } = this.analyticsData.summary;
    return totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
  }

  onBack(): void {
    this.router.navigate(['/examiner/tests']);
  }

  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  // Retry mechanism
  retryLoad(): void {
    this.errorMessage = '';
    this.loadAnalytics();
  }
}