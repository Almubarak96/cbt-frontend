
// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { Router, RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ExaminerService } from '../../../service/exaimner.service';
// import { TestModel } from '../../../models/test.model';
// import { TestUpload } from "../test-upload/test-upload";

// @Component({
//   selector: 'app-test-list',
//   imports: [RouterModule, CommonModule, FormsModule, TestUpload],
//   templateUrl: './test-list.html',
//   styleUrl: './test-list.scss'
// })
// export class TestList {
//   // Remove local storage of all tests - we only store current page
//   paginatedTests: TestModel[] = [];
//   loading = false;
//   error: string | null = null;

//   // Pagination & Sorting - updated for backend
//   currentPage = 0; // Backend uses 0-based indexing
//   pageSize = 2;
//   totalItems = 0;
//   totalPages = 0;

//   // Sorting
//   sortField = 'id';
//   sortDirection: 'asc' | 'desc' = "asc";// = 'desc';
//   searchTerm: string = '';

//   // Filtering
//   statusFilter: 'all' | boolean = 'all';

//   constructor(
//     private examinerService: ExaminerService,
//     private router: Router
//   ) { }

//   ngOnInit(): void {
//     this.loadTests();
//   }

//   // Updated to use backend pagination
//   loadTests(): void {
//     this.loading = true;

//     const sort = `${this.sortField},${this.sortDirection}`;

//     this.examinerService.getTestsPaginated(this.currentPage, this.pageSize, sort).subscribe({
//       next: (response: any) => {
//         this.paginatedTests = response.tests;
//         this.totalItems = response.totalItems;
//         this.totalPages = response.totalPages;
//         this.error = null;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.error = 'Failed to load tests. Please try again.';
//         this.loading = false;
//       }
//     });
//   }

//   // Search with backend support
//   onSearch(event: any): void {
//     const keyword = event.target.value;
//     this.searchTerm = keyword;
//     this.currentPage = 0;

//     if (keyword && keyword.trim().length > 0) {
//       this.performSearch(keyword);
//     } else {
//       this.loadTests(); // Load all tests if search is empty
//     }
//   }

//   performSearch(keyword: string): void {
//     this.loading = true;
//     const sort = `${this.sortField},${this.sortDirection}`;

//     this.examinerService.searchTests(keyword, this.currentPage, this.pageSize, sort).subscribe({
//       next: (response: any) => {
//         this.paginatedTests = response.tests;
//         this.totalItems = response.totalItems;
//         this.totalPages = response.totalPages;
//         this.error = null;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.error = 'Failed to search tests. Please try again.';
//         this.loading = false;
//       }
//     });
//   }

//   // Filter by status
//   filterByStatus(status: 'all' | boolean): void {
//     this.statusFilter = status;
//     this.currentPage = 0;

//     if (status === 'all') {
//       this.loadTests();
//     } else {
//       this.loadTestsByStatus(status);
//     }
//   }

//   loadTestsByStatus(published: boolean): void {
//     this.loading = true;
//     const sort = `${this.sortField},${this.sortDirection}`;

//     this.examinerService.getTestsByStatus(published, this.currentPage, this.pageSize, sort).subscribe({
//       next: (response: any) => {
//         this.paginatedTests = response.tests;
//         this.totalItems = response.totalItems;
//         this.totalPages = response.totalPages;
//         this.error = null;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.error = 'Failed to load tests. Please try again.';
//         this.loading = false;
//       }
//     });
//   }

//   // Updated pagination methods
//   get startIndex(): number {
//     return (this.currentPage * this.pageSize) + 1;
//   }

//   get endIndex(): number {
//     return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
//   }

//   changePage(page: number): void {
//     if (page >= 0 && page < this.totalPages) {
//       this.currentPage = page;

//       // Reload based on current filter state
//       if (this.searchTerm && this.searchTerm.trim().length > 0) {
//         this.performSearch(this.searchTerm);
//       } else if (this.statusFilter !== 'all') {
//         this.loadTestsByStatus(this.statusFilter as boolean);
//       } else {
//         this.loadTests();
//       }
//     }
//   }

//   onPageSizeChange(): void {
//     this.currentPage = 0;
//     this.loadTests(); // Reload with new page size
//   }

//   // Simple pagination - only numbers
//   getVisiblePages(): number[] {
//     const pages: number[] = [];
//     const maxVisible = 5;

//     let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
//     let end = Math.min(this.totalPages - 1, start + maxVisible - 1);

//     // Adjust start if we're near the end
//     if (end - start + 1 < maxVisible) {
//       start = Math.max(0, end - maxVisible + 1);
//     }

//     for (let i = start; i <= end; i++) {
//       pages.push(i);
//     }

//     return pages;
//   }

//   // Updated sorting - reloads from backend
//   sortTable(key: string): void {
//     if (this.sortField === key) {
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       this.sortField = key;
//       this.sortDirection = 'asc';
//     }

//     this.currentPage = 0; // Reset to first page when sorting

//     // Reload based on current state
//     if (this.searchTerm && this.searchTerm.trim().length > 0) {
//       this.performSearch(this.searchTerm);
//     } else if (this.statusFilter !== 'all') {
//       this.loadTestsByStatus(this.statusFilter as boolean);
//     } else {
//       this.loadTests();
//     }
//   }

//   getSortIcon(key: string): string {
//     if (this.sortField !== key) return 'bi bi-arrow-down-up text-muted';
//     return this.sortDirection === 'asc' ? 'bi bi-sort-up-alt text-primary' : 'bi bi-sort-down-alt text-primary';
//   }

//   // Navigation methods (unchanged)
//   addTest(): void {
//     this.router.navigate(['examiner/tests/new']);
//   }

//   editTest(test: TestModel): void {
//     this.router.navigate(['examiner/tests', test.id, 'edit']);
//   }

//   manageQuestions(test: TestModel): void {
//     this.router.navigate(['examiner/tests', test.id, 'questions']);
//   }

//   // Add this method to your TestList class
//   manageInstructions(test: TestModel): void {
//     this.router.navigate(['/examiner/tests', test.id, 'instructions']);
//   }



//   // Utility Methods for Component

//   getPublishedCount(): number {
//     // You might want to implement this based on your data
//     return this.paginatedTests.filter(test => test.published).length;
//   }

//   getDraftCount(): number {
//     // You might want to implement this based on your data
//     return this.paginatedTests.filter(test => !test.published).length;
//   }

//   formatDate(date: string): string {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   }

//   clearSearch(): void {
//     this.searchTerm = '';
//     this.currentPage = 0;
//     this.loadTests();
//   }

//   onUploadComplete(): void {
//     // Refresh the list when upload is complete
//     this.loadTests();
//   }
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
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Services
import { ExaminerService } from '../../../service/exaimner.service';

// Models
import { TestModel } from '../../../models/test.model';

// Components
import { TestUpload } from "../test-upload/test-upload";

/**
 * TEST MANAGEMENT COMPONENT
 * 
 * @author Almubarak Suleiman
 * @description Comprehensive test management with advanced filtering, 
 *              pagination, and responsive design
 * @backend-compatibility Spring Boot Paginated API
 * 
 * FEATURES:
 * Debounced search (400ms)
 * Status filtering
 * Responsive card layout
 * Accessibility compliant
 * Optimized performance
 * Mobile-first design
 * Error handling
 * Loading states
 */
// Types for enhanced type safety
type StatusFilter = 'all' | boolean;
type SortDirection = 'asc' | 'desc';
type SortField = 'id' | 'title' | 'createdAt' | 'totalMarks';

interface PaginationResponse {
  tests: TestModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Component({
  selector: 'app-test-list',
  templateUrl: './test-list.html',
  styleUrls: ['./test-list.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TestUpload],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestList implements OnInit, OnDestroy {
  // ==================== DEPENDENCY INJECTION ====================
  private examinerService = inject(ExaminerService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // ==================== COMPONENT STATE ====================
  paginatedTests: TestModel[] = [];
  loading = false;
  error: string | null = null;

  // ==================== PAGINATION CONFIG ====================
  currentPage = 0;
  pageSize = 4;
  totalItems = 0;
  totalPages = 0;
  readonly pageSizeOptions = [4, 10, 20, 50];

  // ==================== FILTERS & SEARCH ====================
  searchTerm = '';
  statusFilter: StatusFilter = 'all';

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
    this.loadTests();
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
      this.loadTests();
    });
  }

  // ==================== DATA LOADING METHODS ====================
  /**
   * Main method to load tests with current filters and pagination
   */
  loadTests(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.examinerService.getTestsPaginated(
      this.currentPage,
      this.pageSize,
      this.getSortString()
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: PaginationResponse) => this.handleSuccess(response),
      error: (error) => this.handleError('Failed to load tests', error)
    });
  }

  /**
   * Handle successful data loading
   */
  private handleSuccess(response: PaginationResponse): void {
    this.paginatedTests = response.tests;
    this.totalItems = response.totalItems;
    this.totalPages = response.totalPages;
    this.loading = false;
    this.cdr.markForCheck();
  }

  /**
   * Handle errors with user-friendly messages
   */
  private handleError(message: string, error?: any): void {
    console.error('Test loading error:', error);
    this.error = message;
    this.loading = false;
    this.paginatedTests = [];
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
   * Clear search and reset to show all tests
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  /**
   * Filter tests by publication status
   */
  filterByStatus(status: StatusFilter): void {
    this.statusFilter = status;
    this.currentPage = 0;
    
    if (status === 'all') {
      this.loadTests();
    } else {
      this.loadTestsByStatus(status);
    }
  }

  /**
   * Load tests filtered by publication status
   */
  private loadTestsByStatus(published: boolean): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.examinerService.getTestsByStatus(
      published,
      this.currentPage,
      this.pageSize,
      this.getSortString()
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: PaginationResponse) => this.handleSuccess(response),
      error: (error) => this.handleError('Failed to load tests', error)
    });
  }

  /**
   * Perform search with current search term
   */
  private performSearch(keyword: string): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.examinerService.searchTests(
      keyword,
      this.currentPage,
      this.pageSize,
      this.getSortString()
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: PaginationResponse) => this.handleSuccess(response),
      error: (error) => this.handleError('Failed to search tests', error)
    });
  }

  // ==================== PAGINATION METHODS ====================
  /**
   * Navigate to specific page
   */
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      
      // Reload based on current filter state
      if (this.searchTerm) {
        this.performSearch(this.searchTerm);
      } else if (this.statusFilter !== 'all') {
        this.loadTestsByStatus(this.statusFilter as boolean);
      } else {
        this.loadTests();
      }
    }
  }

  /**
   * Handle page size changes
   */
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadTests();
  }

  /**
   * Get visible pages for pagination display
   */
  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);

    // Adjust if we're near the start
    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ==================== UTILITY METHODS ====================
  /**
   * Get sort string for API calls
   */
  private getSortString(): string {
    return 'createdAt,desc'; // Default sorting
  }

  /**
   * Get count of published tests
   */
  getPublishedCount(): number {
    return this.paginatedTests.filter(test => test.published).length;
  }

  /**
   * Get count of draft tests
   */
  getDraftCount(): number {
    return this.paginatedTests.filter(test => !test.published).length;
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // ==================== NAVIGATION METHODS ====================
  /**
   * Navigate to create test form
   */
  addTest(): void {
    this.router.navigate(['examiner/tests/new']);
  }

  /**
   * Navigate to edit test form
   */
  editTest(test: TestModel): void {
    this.router.navigate(['examiner/tests', test.id, 'edit']);
  }

  /**
   * Navigate to manage questions for a test
   */
  manageQuestions(test: TestModel): void {
    this.router.navigate(['examiner/tests', test.id, 'questions']);
  }

  /**
   * Navigate to manage instructions for a test
   */
  manageInstructions(test: TestModel): void {
    this.router.navigate(['/examiner/tests', test.id, 'instructions']);
  }

  // ==================== EVENT HANDLERS ====================
  /**
   * Handle upload completion
   */
  onUploadComplete(): void {
    this.loadTests();
  }

  // ==================== GETTERS ====================
  get startIndex(): number {
    return (this.currentPage * this.pageSize) + 1;
  }

  get endIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  // ==================== TRACKBY FUNCTIONS ====================
/**
 * TrackBy function for test list for optimal rendering performance
 */
trackByTestId(index: number, test: TestModel): number {
  return test.id || index;
}

  // ==================== CLEANUP ====================
  private cleanupSubscriptions(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}