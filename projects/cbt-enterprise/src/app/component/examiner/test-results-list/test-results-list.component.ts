// // test-results-list.component.ts
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ResultsResponse, ResultsService, TestResultSummary } from '../../../service/test-results.service';


// @Component({
//   selector: 'app-test-results-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './test-results-list.component.html',
//   styleUrls: ['./test-results-list.component.scss']
// })
// export class TestResultsListComponent implements OnInit {
//   testResults: TestResultSummary[] = [];
//   isLoading = false;
//   errorMessage = '';
  
//   // Pagination
//   currentPage = 0;
//   pageSize = 1;
//   totalElements = 0;
//   totalPages = 0;
  
//   // Filters
//   searchTerm = '';
//   statusFilter = 'all';
//   sortBy = 'createdAt';
//   sortDirection = 'desc';

//   constructor(
//     private resultsService: ResultsService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadTestResults();
//   }

//   loadTestResults(): void {
//     this.isLoading = true;
//     this.errorMessage = '';

//     this.resultsService.getTestResults(
//       this.currentPage,
//       this.pageSize,
//       this.sortBy,
//       this.sortDirection,
//       this.searchTerm,
//       this.statusFilter === 'all' ? undefined : this.statusFilter
//     ).subscribe({
//       next: (response: ResultsResponse<TestResultSummary>) => {
//         this.testResults = response.content;
//         this.totalElements = response.totalElements;
//         this.totalPages = response.totalPages;
//         this.isLoading = false;
//       },
//       error: (error) => {
//         this.errorMessage = 'Failed to load test results';
//         this.isLoading = false;
//         console.error('Error loading test results:', error);
//       }
//     });
//   }

//   onSearch(event: any): void {
//     const keyword = event.target.value;
//     this.searchTerm = keyword;
//     this.currentPage = 0;
//     this.loadTestResults();
//   }

//   onFilterChange(): void {
//     this.currentPage = 0;
//     this.loadTestResults();
//   }

//   onSort(column: string): void {
//     if (this.sortBy === column) {
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       this.sortBy = column;
//       this.sortDirection = 'desc';
//     }
//     this.loadTestResults();
//   }

//   onPageChange(page: number): void {
//     this.currentPage = page;
//     this.loadTestResults();
//   }

//   viewStudentResults(testId: number): void {
//     this.router.navigate(['/examiner/results', testId, 'students']);
//   }

//   viewAnalytics(testId: number): void {
//     this.router.navigate(['/examiner/analytics', testId]);
//   }

//   getScoreColor(score: number): string {
//     if (score >= 80) return 'success';
//     if (score >= 60) return 'warning';
//     return 'danger';
//   }

//   getPassRateColor(passRate: number): string {
//     if (passRate >= 80) return 'success';
//     if (passRate >= 60) return 'warning';
//     return 'danger';
//   }

//   getCompletionRate(test: TestResultSummary): number {
//     return test.totalStudents > 0 ? (test.completedStudents / test.totalStudents) * 100 : 0;
//   }



//   // Add these methods to your existing component

// getSortIcon(column: string): string {
//   if (this.sortBy !== column) {
//     return 'bi bi-arrow-down-up';
//   }
//   return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
// }




// clearFilters(): void {
//   this.searchTerm = '';
//   this.statusFilter = 'all';
//   this.currentPage = 0;
//   this.loadTestResults();
// }


// // Add these methods to your TestResultsListComponent

// /** Check if any filters are active */
// hasActiveFilters(): boolean {
//   return !!this.searchTerm || this.statusFilter !== 'all';
// }

// /** Set status filter and reload results */
// setStatusFilter(status: string): void {
//   this.statusFilter = status;
//   this.currentPage = 0;
//   this.loadTestResults();
// }

// /** Clear search and reload */
// clearSearch(): void {
//   this.searchTerm = '';
//   this.currentPage = 0;
//   this.loadTestResults();
// }

// /** Refresh results */
// refreshResults(): void {
//   this.loadTestResults();
// }

// /** Export all results */
// exportResults(): void {
//   // Implement export logic
//   console.log('Exporting all results...');
// }

// /** Export specific test results */
// exportTestResults(testId: number): void {
//   // Implement export logic for specific test
//   console.log('Exporting results for test:', testId);
// }

// /** Get published tests count */
// getPublishedCount(): number {
//   return this.testResults.filter(test => test.published).length;
// }

// /** Get draft tests count */
// getDraftCount(): number {
//   return this.testResults.filter(test => !test.published).length;
// }

// /** Get average completion rate across all tests */
// getAverageCompletionRate(): number {
//   if (this.testResults.length === 0) return 0;
  
//   const totalCompletion = this.testResults.reduce((sum, test) => {
//     return sum + this.getCompletionRate(test);
//   }, 0);
  
//   return totalCompletion / this.testResults.length;
// }

// /** Get average score across all tests */
// getAverageScore(): number {
//   if (this.testResults.length === 0) return 0;
  
//   const totalScore = this.testResults.reduce((sum, test) => {
//     return sum + (test.averageScore || 0);
//   }, 0);
  
//   return totalScore / this.testResults.length;
// }

// /** Handle page size change */
// onPageSizeChange(): void {
//   this.currentPage = 0;
//   this.loadTestResults();
// }




































// // Fix the getVisiblePages method
// getVisiblePages(): number[] {
//   const totalPages = this.totalPages;
//   const currentPage = this.currentPage;
  
//   if (totalPages <= 7) {
//     // Show all pages if total pages is small
//     return Array.from({ length: totalPages }, (_, i) => i);
//   }
  
//   const pages: number[] = [];
  
//   // Always show first page
//   pages.push(0);
  
//   // Show pages around current page
//   const startPage = Math.max(1, currentPage - 1);
//   const endPage = Math.min(totalPages - 2, currentPage + 1);
  
//   // Add ellipsis after first page if needed
//   if (startPage > 1) {
//     pages.push(-1); // Ellipsis
//   }
  
//   // Add middle pages
//   for (let i = startPage; i <= endPage; i++) {
//     pages.push(i);
//   }
  
//   // Add ellipsis before last page if needed
//   if (endPage < totalPages - 2) {
//     pages.push(-2); // Ellipsis
//   }
  
//   // Always show last page if there is more than one page
//   if (totalPages > 1) {
//     pages.push(totalPages - 1);
//   }
  
//   return pages;
// }

// // Fix the changePage method
// changePage(page: number): void {
//   if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
//     this.currentPage = page;
//     this.loadTestResults();
    
//     // Scroll to top when changing pages
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }
// }

// // Fix the startIndex and endIndex calculations
// get startIndex(): number {
//   if (this.totalElements === 0) return 0;
//   return (this.currentPage * this.pageSize) + 1;
// }

// get endIndex(): number {
//   if (this.totalElements === 0) return 0;
//   return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
// }

// // Add this method to check if page is ellipsis
// isEllipsis(page: number): boolean {
//   return page === -1 || page === -2;
// }

// }




import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ResultsResponse, ResultsService, TestResultSummary } from '../../../service/test-results.service';

/**
 * TEST RESULTS MANAGEMENT COMPONENT
 * 
 * @author Almubarak Suleiman
 * @description Comprehensive test results analytics with debounced search,
 *              2-column responsive layout, and performance optimization
 * @backend-compatibility Spring Boot Paginated API
 * 
 * FEATURES:
 * Debounced search (400ms)
 * 2-column responsive grid layout
 * Performance optimized with trackBy
 * Accessibility compliant
 * Mobile-first design
 * Error handling
 * Loading states
 */
// Types for enhanced type safety
type StatusFilter = 'all' | 'published' | 'draft';
type SortDirection = 'asc' | 'desc';
type SortField = 'createdAt' | 'testTitle' | 'averageScore' | 'passRate';

@Component({
  selector: 'app-test-results-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './test-results-list.component.html',
  styleUrls: ['./test-results-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestResultsListComponent implements OnInit, OnDestroy {
  // ==================== DEPENDENCY INJECTION ====================
  private resultsService = inject(ResultsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // ==================== COMPONENT STATE ====================
  testResults: TestResultSummary[] = [];
  isLoading = false;
  errorMessage = '';
  
  // ==================== PAGINATION CONFIG ====================
  currentPage = 0;
  pageSize = 6; // Increased for 2-column layout
  totalElements = 0;
  totalPages = 0;
  readonly pageSizeOptions = [6, 12, 24, 48];

  // ==================== FILTERS & SEARCH ====================
  searchTerm = '';
  statusFilter: StatusFilter = 'all';
  sortBy: SortField = 'createdAt';
  sortDirection: SortDirection = 'desc';

  // ==================== PRIVATE SUBJECTS ====================
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ==================== LIFECYCLE HOOKS ====================
  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  // ==================== INITIALIZATION METHODS ====================
  /**
   * Initialize component with search debouncing and load initial data
   */
  private initializeComponent(): void {
    this.setupSearchDebounce();
    this.loadTestResults();
  }

  /**
   * Setup search debouncing for performance optimization
   * Prevents API calls on every keystroke
   */
  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400), // Wait 400ms after user stops typing
      distinctUntilChanged(), // Only emit if value changed
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 0; // Reset to first page when searching
      this.loadTestResults();
    });
  }

  // ==================== DATA LOADING METHODS ====================
  /**
   * Main method to load test results with current filters and pagination
   */
  loadTestResults(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.resultsService.getTestResults(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDirection,
      this.searchTerm,
      this.statusFilter === 'all' ? undefined : this.statusFilter
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: ResultsResponse<TestResultSummary>) => this.handleSuccess(response),
      error: (error) => this.handleError('Failed to load test results', error)
    });
  }

  /**
   * Handle successful data loading
   */
  private handleSuccess(response: ResultsResponse<TestResultSummary>): void {
    this.testResults = response.content;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  /**
   * Handle errors with user-friendly messages
   */
  private handleError(message: string, error?: any): void {
    console.error('Test results loading error:', error);
    this.errorMessage = message;
    this.isLoading = false;
    this.testResults = [];
    this.cdr.markForCheck();
  }

  // ==================== SEARCH & FILTER METHODS ====================
  /**
   * Trigger search with debouncing - called on every input event
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value.trim());
  }

  /**
   * Clear search and reset to show all results
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  /**
   * Set status filter and reload results
   */
  setStatusFilter(status: StatusFilter): void {
    this.statusFilter = status;
    this.currentPage = 0;
    this.loadTestResults();
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!this.searchTerm || this.statusFilter !== 'all';
  }

  /**
   * Clear all filters and reset
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.currentPage = 0;
    this.searchSubject.next('');
  }

  // ==================== PAGINATION METHODS ====================
  /**
   * Navigate to specific page
   */
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTestResults();
      this.scrollToTop();
    }
  }

  /**
   * Handle page size changes
   */
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadTestResults();
  }

  /**
   * Get visible pages for pagination display
   */
  getVisiblePages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    const pages: number[] = [];
    pages.push(0);
    
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages - 2, currentPage + 1);
    
    if (startPage > 1) {
      pages.push(-1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 2) {
      pages.push(-2);
    }
    
    if (totalPages > 1) {
      pages.push(totalPages - 1);
    }
    
    return pages;
  }

  // ==================== UTILITY METHODS ====================
  /**
   * Get sort icon for table headers
   */
  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'bi-arrow-down-up text-muted';
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up text-primary' : 'bi-arrow-down text-primary';
  }

  /**
   * Get color class based on score value
   */
  getScoreColor(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }

  /**
   * Get color class based on pass rate value
   */
  getPassRateColor(passRate: number): string {
    if (passRate >= 80) return 'success';
    if (passRate >= 60) return 'warning';
    return 'danger';
  }

  /**
   * Calculate completion rate percentage
   */
  getCompletionRate(test: TestResultSummary): number {
    return test.totalStudents > 0 ? (test.completedStudents / test.totalStudents) * 100 : 0;
  }

  /**
   * Get count of published tests
   */
  getPublishedCount(): number {
    return this.testResults.filter(test => test.published).length;
  }

  /**
   * Get count of draft tests
   */
  getDraftCount(): number {
    return this.testResults.filter(test => !test.published).length;
  }

  /**
   * Get average completion rate across all tests
   */
  getAverageCompletionRate(): number {
    if (this.testResults.length === 0) return 0;
    const totalCompletion = this.testResults.reduce((sum, test) => {
      return sum + this.getCompletionRate(test);
    }, 0);
    return totalCompletion / this.testResults.length;
  }

  /**
   * Get average score across all tests
   */
  getAverageScore(): number {
    if (this.testResults.length === 0) return 0;
    const totalScore = this.testResults.reduce((sum, test) => {
      return sum + (test.averageScore || 0);
    }, 0);
    return totalScore / this.testResults.length;
  }

  // ==================== TRACKBY FUNCTIONS ====================
  /**
   * TrackBy function for optimal rendering performance
   */
  trackByTestId(index: number, test: TestResultSummary): number {
    return test.testId || index;
  }

  /**
   * Check if page number is ellipsis
   */
  isEllipsis(page: number): boolean {
    return page === -1 || page === -2;
  }

  // ==================== NAVIGATION METHODS ====================
  /**
   * Navigate to student results for a specific test
   */
  viewStudentResults(testId: number): void {
    this.router.navigate(['/examiner/results', testId, 'students']);
  }

  /**
   * Navigate to analytics for a specific test
   */
  viewAnalytics(testId: number): void {
    this.router.navigate(['/examiner/analytics', testId]);
  }

  // ==================== EVENT HANDLERS ====================
  /**
   * Refresh results data
   */
  refreshResults(): void {
    this.loadTestResults();
  }

  /**
   * Export all results (placeholder implementation)
   */
  exportResults(): void {
    console.log('Exporting all results...');
    // Implement export logic here
  }

  /**
   * Export specific test results (placeholder implementation)
   */
  exportTestResults(testId: number): void {
    console.log('Exporting results for test:', testId);
    // Implement export logic here
  }

  // ==================== GETTERS ====================
  get startIndex(): number {
    if (this.totalElements === 0) return 0;
    return (this.currentPage * this.pageSize) + 1;
  }

  get endIndex(): number {
    if (this.totalElements === 0) return 0;
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  // ==================== UTILITY METHODS ====================
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private cleanupSubscriptions(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}