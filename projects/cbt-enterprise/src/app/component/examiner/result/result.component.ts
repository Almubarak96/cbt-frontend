// result.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ResultsService, StudentExamResult, StudentDetailedResult, TestResultSummary, ResultsResponse } from '../../../service/test-results.service';
import { AuthService } from '../../../service/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result',
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isExaminer: boolean = false;
  isStudent: boolean = true;
  
  // Student view data
  studentResults: StudentExamResult[] = [];
  selectedStudentResult: StudentDetailedResult | null = null;
  
  // Examiner view data
  testSummaries: TestResultSummary[] = [];
  studentExamResults: StudentExamResult[] = [];
  selectedTestId: number | null = null;
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  
  // Loading states
  loading: boolean = false;
  loadingStudents: boolean = false;
  loadingDetails: boolean = false;
  
  error: string = '';
  
  // Print state
  isPrinting: boolean = false;

  constructor(
    private resultsService: ResultsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkUserRole() {
// const userRole = this.authService.getUserRole();
   // this.isExaminer = userRole === 'EXAMINER' || userRole === 'ADMIN';
  // this.isStudent = userRole === 'STUDENT';
  }

  private loadInitialData() {
    if (this.isStudent) {
      this.loadStudentResults();
    } else if (this.isExaminer) {
      this.loadTestSummaries();
    }
  }

  // Student methods
  loadStudentResults() {
    this.loading = true;
    // Note: You might need to add a new endpoint for student's own results
    // For now, using the existing structure
    this.resultsService.getTestResults(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResultsResponse<TestResultSummary>) => {
          // In a real scenario, you'd have a dedicated endpoint for student results
          // This is a placeholder - you'll need to implement the actual student results endpoint
          this.studentResults = []; // This would be populated from a different endpoint
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load results';
          this.loading = false;
          console.error('Error loading student results:', error);
        }
      });
  }

  viewStudentDetailedResult(sessionId: number) {
    this.loadingDetails = true;
    this.resultsService.getStudentDetailedResult(sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: StudentDetailedResult) => {
          this.selectedStudentResult = result;
          this.loadingDetails = false;
        },
        error: (error) => {
          this.error = 'Failed to load detailed result';
          this.loadingDetails = false;
        }
      });
  }

  // Examiner methods
  loadTestSummaries(page: number = 0) {
    this.loading = true;
    this.currentPage = page;
    
    this.resultsService.getTestResults(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResultsResponse<TestResultSummary>) => {
          this.testSummaries = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load test summaries';
          this.loading = false;
        }
      });
  }

  loadStudentResultsForTest(testId: number, page: number = 0) {
    this.selectedTestId = testId;
    this.loadingStudents = true;
    this.currentPage = page;
    
    this.resultsService.getStudentResults(testId, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResultsResponse<StudentExamResult>) => {
          this.studentExamResults = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loadingStudents = false;
        },
        error: (error) => {
          this.error = 'Failed to load student results';
          this.loadingStudents = false;
        }
      });
  }

  viewStudentResultAsExaminer(sessionId: number) {
    this.loadingDetails = true;
    this.resultsService.getStudentDetailedResult(sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: StudentDetailedResult) => {
          this.selectedStudentResult = result;
          this.loadingDetails = false;
        },
        error: (error) => {
          this.error = 'Failed to load student result';
          this.loadingDetails = false;
        }
      });
  }

  // Pagination methods
  onPageChange(page: number) {
    if (this.selectedTestId) {
      this.loadStudentResultsForTest(this.selectedTestId, page);
    } else {
      this.loadTestSummaries(page);
    }
  }

  // Export functionality
  exportResults(format: 'csv' | 'pdf' | 'excel' = 'csv') {
    if (!this.selectedTestId) {
      this.error = 'Please select a test first';
      return;
    }

    this.resultsService.exportResults(this.selectedTestId, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          this.downloadFile(blob, format);
        },
        error: (error) => {
          this.error = 'Failed to export results';
        }
      });
  }

  private downloadFile(blob: Blob, format: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const extension = format === 'excel' ? 'xlsx' : format;
    link.download = `test-results-${this.selectedTestId}-${new Date().getTime()}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Print functionality
  printResult() {
    this.isPrinting = true;
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
    }, 500);
  }

  closeDetailedView() {
    this.selectedStudentResult = null;
  }

  getStatusBadgeClass(status: string): string {
    if (!status) return 'bg-secondary';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'graded':
        return 'bg-success';
      case 'in_progress':
      case 'in progress':
        return 'bg-warning';
      case 'submitted':
        return 'bg-info';
      case 'not_started':
      case 'not started':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getGradeBadgeClass(grade: string): string {
    if (!grade) return 'bg-secondary';
    
    switch (grade?.toUpperCase()) {
      case 'A': return 'bg-success';
      case 'B': return 'bg-info';
      case 'C': return 'bg-primary';
      case 'D': return 'bg-warning';
      case 'F': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  get currentDate(): Date {
    return new Date();
  }
}