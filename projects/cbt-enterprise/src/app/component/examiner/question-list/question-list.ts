
// import { Component, Input } from '@angular/core';
// import { ExaminerService } from '../../../service/exaimner.service';
// import { QuestionModel } from '../../../models/question.model';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { JsonToChoicesPipe } from '../../../pipes/jsonToChoicesPipe';
// import { TestModel } from '../../../models/test.model';
// import { QuestionUpload } from "../question-upload/question-upload";
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-question-list',
//   imports: [CommonModule, JsonToChoicesPipe, QuestionUpload, FormsModule],
//   templateUrl: './question-list.html',
//   styleUrl: './question-list.scss'
// })
// export class QuestionList {

//   /** List of all questions for the selected test */
//   questions: QuestionModel[] = [];

//   n!: TestModel;

//   /** Selected test ID */
//   testId!: number;

//   /** Loading indicator */
//   loading = false;

//   /** Error message for display */
//   error: string | null = null;

//   // NEW: Pagination and Search Properties
//   currentPage = 0;
//   pageSize = 5;
//   totalItems = 0;
//   totalPages = 0;
//   hasNext = false;
//   hasPrevious = false;

//   // NEW: Search and Filter Properties
//   searchKeyword = '';
//   selectedType = '';
//   minMarks: any;
//   maxMarks: any;

//   // NEW: Available question types for filter dropdown
//   questionTypes: string[] = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'];

//   // NEW: Sort options
//   sortField = 'id';
//   sortDirection = 'desc';

//   constructor(
//     private questionService: ExaminerService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) { }

//   /**
//    * Loads all questions for the selected test on component initialization.
//    */
//   ngOnInit(): void {
//     this.route.paramMap.subscribe(params => {
//       this.testId = Number(params.get('testId'));
//       this.loadQuestions();
//     });
//   }

//   /** Loads the list of questions for the test from the backend */
//   loadQuestions(): void {
//     this.loading = true;

//     // NEW: Use paginated endpoint if any search/filter is active, otherwise use simple list
//     if (this.hasActiveFilters() || this.currentPage > 0) {
//       this.loadPaginatedQuestions();
//     } else {
//       // Backward compatible: load simple list when no filters/pagination
//       this.questionService.getQuestionsByTest(this.testId).subscribe({
//         next: (data) => {
//           this.questions = data;
//           this.error = null;
//           this.loading = false;

//         },
//         error: () => {
//           this.error = 'Failed to load questions.';
//           this.loading = false;
//         }
//       });
//     }
//   }

//   /** NEW: Load questions with pagination, search, and filters */
//   loadPaginatedQuestions(): void {
//     this.loading = true;

//     this.questionService.getQuestionsPaginated(
//       this.testId,
//       this.currentPage,
//       this.pageSize,
//       this.sortField,
//       this.sortDirection,
//       this.searchKeyword,
//       this.selectedType,
//       this.minMarks,
//       this.maxMarks
//     ).subscribe({
//       next: (response: any) => {
//         this.questions = response.questions;
//         this.currentPage = response.currentPage;
//         this.totalItems = response.totalItems;
//         this.totalPages = response.totalPages;
//         this.hasNext = response.hasNext;
//         this.hasPrevious = response.hasPrevious;
//         this.error = null;
//         this.loading = false;
//       },
//       error: () => {
//         this.error = 'Failed to load questions.';
//         this.loading = false;
//       }
//     });
//   }

//   /** NEW: Check if any search or filter is active */
//   hasActiveFilters(): boolean {
//     return !!this.searchKeyword || !!this.selectedType || this.minMarks !== null || this.maxMarks !== null;
//   }

//   /** NEW: Search questions */
//   onSearch(event: any): void {
//     const keyword = event.target.value;
//     this.searchKeyword =keyword
//     this.currentPage = 0; // Reset to first page when searching
//     this.loadPaginatedQuestions();
//   }

//   // /** NEW: Clear all filters and search */
//   // clearFilters(): void {
//   //   this.searchKeyword = '';
//   //   this.selectedType = '';
//   //   this.minMarks = null;
//   //   this.maxMarks = null;
//   //   this.currentPage = 0;
//   //   this.loadQuestions(); // This will automatically use simple list since no filters
//   // }

//   /** NEW: Change page */
//   goToPage(page: number): void {
//     this.currentPage = page;
//     this.loadPaginatedQuestions();
//   }

//   /** NEW: Change page size */
//   onPageSizeChange(): void {
//     this.currentPage = 0;
//     this.loadPaginatedQuestions();
//   }

//   /** NEW: Sort questions */
//   onSort(field: string): void {
//     if (this.sortField === field) {
//       // Toggle direction if same field
//       this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     } else {
//       // New field, default to ascending
//       this.sortField = field;
//       this.sortDirection = 'asc';
//     }
//     this.loadPaginatedQuestions();
//   }

//   /** NEW: Get sort icon class */
//   getSortIcon(field: string): string {
//     if (this.sortField !== field) {
//       return 'bi-arrow-down-up'; // Default icon when not sorted by this field
//     }
//     return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
//   }

//   onBack(): void {
//     this.router.navigate(['/examiner/tests']);
//   }

//   /** Navigates to the question creation form */
//   addQuestion(): void {
//     this.router.navigate(['examiner/tests', this.testId, 'questions', 'new']);
//   }

//   /** Navigates to the question edit form */
//   editQuestion(question: QuestionModel): void {
//     this.router.navigate(['examiner/tests', this.testId, 'questions', question.id, 'edit']);
//   }



//   // Add these methods to your QuestionList component

//   /** NEW: Get visible pages for pagination */
//   getVisiblePages(): number[] {
//     const pages: number[] = [];
//     const total = this.totalPages;
//     const current = this.currentPage;

//     // Show up to 5 pages around current page
//     let start = Math.max(0, current - 2);
//     let end = Math.min(total - 1, current + 2);

//     // Adjust if we're near the start
//     if (current < 3) {
//       end = Math.min(total - 1, 4);
//     }

//     // Adjust if we're near the end
//     if (current > total - 4) {
//       start = Math.max(0, total - 5);
//     }

//     for (let i = start; i <= end; i++) {
//       pages.push(i);
//     }

//     return pages;
//   }

//   /** NEW: Calculate start and end indices for display */
//   get startIndex(): number {
//     return (this.currentPage * this.pageSize) + 1;
//   }

//   get endIndex(): number {
//     return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
//   }




// // Add these methods to your QuestionList component with proper type handling

// /** Get count of multiple choice questions */
// getMultipleChoiceCount(): number {
//   return this.questions.filter(q => q.type === 'MULTIPLE_CHOICE').length;
// }

// /** Get count of true/false questions */
// getTrueFalseCount(): number {
//   return this.questions.filter(q => q.type === 'TRUE_FALSE').length;
// }

// /** Get count of other question types */
// getOtherTypesCount(): number {
//   return this.questions.filter(q => 
//     q.type !== 'MULTIPLE_CHOICE' && q.type !== 'TRUE_FALSE'
//   ).length;
// }

// /** Get CSS class for question type badge */
// getQuestionTypeClass(type: string): string {
//   switch(type) {
//     case 'MULTIPLE_CHOICE': return 'badge-mcq';
//     case 'TRUE_FALSE': return 'badge-tf';
//     case 'ESSAY': return 'badge-essay';
//     case 'SHORT_ANSWER': return 'badge-info';
//     default: return 'badge-default';
//   }
// }

// /** Format question type for display */
// formatQuestionType(type: string): string {
//   if (!type) return 'Unknown';

//   return type
//     .replace('_', ' ')
//     .replace(/\b\w/g, l => l.toUpperCase());
// }

// /** Get letter for choice (A, B, C, D, etc.) */
// getChoiceLetter(index: number): string {
//   return String.fromCharCode(65 + index);
// }

// /** Set type filter and reload questions */
// setTypeFilter(type: string): void {
//   this.selectedType = type;
//   this.currentPage = 0;
//   this.loadPaginatedQuestions();
// }

// /** Clear search and reload */
// clearSearch(): void {
//   this.searchKeyword = '';
//   this.currentPage = 0;
//   this.loadPaginatedQuestions();
// }

// /** Handle upload completion */
// onUploadComplete(): void {
//   this.loadPaginatedQuestions();
// }

// /** Preview question (placeholder implementation) */
// previewQuestion(question: QuestionModel): void {
//   // Implement question preview logic
//   console.log('Preview question:', question);
//   // You might want to open a modal or navigate to a preview page
// }

// /** Clear all filters */
// clearFilters(): void {
//   this.searchKeyword = '';
//   this.selectedType = '';
//   this.minMarks = null;
//   this.maxMarks = null;
//   this.currentPage = 0;
//   this.loadQuestions();
// }


// }























import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  HostListener,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Services
import { ExaminerService } from '../../../service/exaimner.service';

// Models
import { QuestionModel } from '../../../models/question.model';
import { TestModel } from '../../../models/test.model';

// Pipes & Components
import { JsonToChoicesPipe } from '../../../pipes/jsonToChoicesPipe';
import { QuestionUpload } from "../question-upload/question-upload";

/**
 * QUESTION MANAGEMENT COMPONENT
 * 
 * @author Almubarak Suleiman
 * @description Comprehensive question management with advanced filtering, 
 *              pagination, and responsive design
 * @backend-compatibility Spring Boot Paginated API
 * 
 * FEATURES:
 * Advanced search with debouncing
 * Multi-criteria filtering
 * Responsive table/card layouts
 * Accessibility compliant
 * Optimized performance
 * Mobile-first design
 * Type safety
 * Error handling
 */
// Types for enhanced type safety
type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'MULTIPLE_SELECT';
type SortDirection = 'asc' | 'desc';
type SortField = 'text' | 'type' | 'maxMarks' | 'correctAnswer';

interface PaginationResponse {
  questions: QuestionModel[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.html',
  styleUrls: ['./question-list.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    JsonToChoicesPipe,
    QuestionUpload
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionList implements OnInit, OnDestroy {
  // ==================== DEPENDENCY INJECTION ====================
  private questionService = inject(ExaminerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  // ==================== COMPONENT STATE ====================
  questions: QuestionModel[] = [];
  loading = false;
  error: string | null = null;
  isMobile = false;

  // ==================== PAGINATION CONFIG ====================
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;
  readonly pageSizeOptions = [5, 10, 20, 50];

  // ==================== FILTERS & SEARCH ====================
  searchKeyword = '';
  selectedType: QuestionType | 'all' = 'all';
  minMarks:any;
  maxMarks: any;

  // ==================== SORTING CONFIG ====================
  sortField: SortField = 'text';
  sortDirection: SortDirection = 'desc';

  // ==================== TEST DATA ====================
  testId!: number;
  testTitle = 'Loading...';

  // ==================== QUESTION TYPES ====================
  readonly questionTypes: QuestionType[] = [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'ESSAY',
    'MULTIPLE_SELECT'
  ];

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

  @HostListener('window:resize')
  onResize(): void {
    this.checkViewport();
  }

  // ==================== INITIALIZATION METHODS ====================
  /**
   * Initialize component with all required setups
   */
  private initializeComponent(): void {
    this.setupSearchDebounce();
    this.checkViewport();
    this.loadTestData();
  }

  /**
   * Setup search debouncing for performance optimization
   */
  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400), // 400ms debounce for better UX
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(keyword => {
      this.searchKeyword = keyword;
      this.currentPage = 0;
      this.loadQuestions();
    });
  }

  /**
   * Load test data from route parameters
   */
  private loadTestData(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const testIdParam = params.get('testId');

      if (testIdParam) {
        this.testId = Number(testIdParam);
        this.loadQuestions();
        this.loadTestDetails();
      } else {
        this.handleError('Invalid test ID provided');
      }
    });
  }

  /**
   * Load additional test details (title, etc.)
   */
  private loadTestDetails(): void {
    // Implementation depends on your API structure
    // this.questionService.getTestDetails(this.testId).subscribe(...)
    this.testTitle = `Test #${this.testId}`;
  }

  /**
   * Check viewport for responsive design
   */
  private checkViewport(): void {
    this.isMobile = window.innerWidth < 768;
    this.cdr.markForCheck();
  }

  // ==================== DATA LOADING METHODS ====================
  /**
   * Main method to load questions with current filters
   */
  loadQuestions(): void {
    if (!this.testId) return;

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.questionService.getQuestionsPaginated(
      this.testId,
      this.currentPage,
      this.pageSize,
      this.sortField,
      this.sortDirection,
      this.searchKeyword,
      this.selectedType === 'all' ? '' : this.selectedType,
      this.minMarks,
      this.maxMarks
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginationResponse) => this.handleSuccess(response),
        error: (error) => this.handleError('Failed to load questions', error)
      });
  }

  /**
   * Handle successful data loading
   */
  private handleSuccess(response: PaginationResponse): void {
    this.questions = response.questions;
    this.currentPage = response.currentPage;
    this.totalItems = response.totalItems;
    this.totalPages = response.totalPages;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
    this.loading = false;
    this.cdr.markForCheck();
  }

  /**
   * Handle errors with user-friendly messages
   */
  private handleError(message: string, error?: any): void {
    console.error('Question loading error:', error);
    this.error = message;
    this.loading = false;
    this.questions = [];
    this.cdr.markForCheck();
  }

  // ==================== SEARCH & FILTER METHODS ====================
  /**
   * Trigger search with debouncing
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value.trim());
  }

  /**
   * Clear search and reset
   */
  clearSearch(): void {
    this.searchKeyword = '';
    this.searchSubject.next('');
  }

  /**
   * Set type filter and reload
   */
  setTypeFilter(type: QuestionType | 'all'): void {
    this.selectedType = type;
    this.currentPage = 0;
    this.loadQuestions();
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!this.searchKeyword ||
      this.selectedType !== 'all' ||
      this.minMarks !== null ||
      this.maxMarks !== null;
  }

  /**
   * Clear all filters and reset to default
   */
  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedType = 'all';
    this.minMarks = null;
    this.maxMarks = null;
    this.currentPage = 0;
    this.searchSubject.next('');
  }

  // ==================== PAGINATION METHODS ====================
  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadQuestions();
      this.scrollToTop();
    }
  }

  /**
   * Handle page size changes
   */
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadQuestions();
  }

  /**
   * Get visible pages for pagination display
   */
  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ==================== SORTING METHODS ====================
  /**
   * Sort table by specific field
   */
  onSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.loadQuestions();
  }

  /**
   * Get sort icon based on current sort state
   */
  getSortIcon(field: SortField): string {
    if (this.sortField !== field) {
      return 'bi-arrow-down-up text-muted';
    }
    return this.sortDirection === 'asc'
      ? 'bi-arrow-up text-primary'
      : 'bi-arrow-down text-primary';
  }

  // ==================== UI UTILITY METHODS ====================
  /**
   * Get display text for question type
   */
  formatQuestionType(type: string): string {
    if (!type) return 'Unknown Type';

    return type
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get CSS classes for question type badges
   */
  getQuestionTypeClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'MULTIPLE_CHOICE': 'badge-mcq',
      'TRUE_FALSE': 'badge-tf',
      'SHORT_ANSWER': 'badge-short',
      'ESSAY': 'badge-essay',
      'MULTIPLE_SELECT': 'badge-multi'
    };
    return typeMap[type] || 'badge-default';
  }

  /**
   * Get choice letters (A, B, C, D)
   */
  getChoiceLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // ==================== COUNT METHODS ====================
  getMultipleChoiceCount(): number {
    return this.questions.filter(q => q.type === 'MULTIPLE_CHOICE').length;
  }

  getTrueFalseCount(): number {
    return this.questions.filter(q => q.type === 'TRUE_FALSE').length;
  }

  getOtherTypesCount(): number {
    return this.questions.filter(q =>
      q.type !== 'MULTIPLE_CHOICE' && q.type !== 'TRUE_FALSE'
    ).length;
  }

  // ==================== TRACKBY FUNCTIONS ====================
  /**
   * TrackBy function for question list for optimal rendering performance
   * @param index - Current index in the list
   * @param question - Question object
   * @returns Unique identifier for the question
   */
  trackByQuestionId(index: number, question: QuestionModel): number {
    return question.id || index;
  }

  /**
   * TrackBy function for choice items
   * @param index - Current index in the list
   * @param choice - Choice string
   * @returns Unique identifier for the choice
   */
  trackByChoiceId(index: number, choice: string): number {
    return index;
  }

  // ==================== NAVIGATION METHODS ====================
  /**
   * Navigate back to tests list
   */
  onBack(): void {
    this.router.navigate(['/examiner/tests']);
  }

  /**
   * Navigate to create question form
   */
  addQuestion(): void {
    this.router.navigate(['examiner/tests', this.testId, 'questions', 'new']);
  }

  /**
   * Navigate to edit question form
   */
  editQuestion(question: QuestionModel): void {
    if (question.id) {
      this.router.navigate([
        'examiner/tests',
        this.testId,
        'questions',
        question.id,
        'edit'
      ]);
    }
  }

  /**
   * Preview question (modal implementation needed)
   */
  previewQuestion(question: QuestionModel): void {
    // TODO: Implement modal preview
    console.log('Preview question:', question);
    // this.openPreviewModal(question);
  }

  // ==================== EVENT HANDLERS ====================
  /**
   * Handle upload completion
   */
  onUploadComplete(): void {
    this.loadQuestions();
    // Close modal if needed
    const modal = document.getElementById('uploadBulkModal');
    if (modal) {
      // Bootstrap modal close logic
      (window as any).bootstrap.Modal.getInstance(modal)?.hide();
    }
  }

  // ==================== UTILITY METHODS ====================
  get startIndex(): number {
    return (this.currentPage * this.pageSize) + 1;
  }

  get endIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private cleanupSubscriptions(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}