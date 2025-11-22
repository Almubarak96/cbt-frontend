import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResultsResponse, ResultsService, StudentExamResult } from '../../../service/test-results.service';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-results.component.html',
  styleUrls: ['./student-results.component.scss']
})
export class StudentResultsComponent implements OnInit {
  testId!: number;
  studentResults: StudentExamResult[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filters
  searchTerm = '';
  minScore?: number;
  maxScore?: number;
  statusFilter = 'all';
  gradedFilter: string = 'all';
  sortBy = 'percentage';
  sortDirection = 'desc';

  // Computed properties for template
  completedCount = 0;
  passedCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultsService: ResultsService
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
    this.loadStudentResults();
  }

  loadStudentResults(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const graded = this.gradedFilter === 'all' ? undefined : this.gradedFilter === 'graded';

    this.resultsService.getStudentResults(
      this.testId,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDirection,
      this.searchTerm,
      this.minScore,
      this.maxScore,
      this.statusFilter === 'all' ? undefined : this.statusFilter,
      graded
    ).subscribe({
      next: (response: ResultsResponse<StudentExamResult>) => {
        this.studentResults = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        
        // Update computed properties
        this.updateComputedProperties();
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load student results';
        this.isLoading = false;
        console.error('Error loading student results:', error);
      }
    });
  }

  private updateComputedProperties(): void {
    this.completedCount = this.studentResults.filter(s => s.completed).length;
    this.passedCount = this.studentResults.filter(s => s.passed).length;
  }

  // Add these methods for pagination calculations
  getNextPage(): number {
    return this.currentPage + 1;
  }

  getPreviousPage(): number {
    return this.currentPage - 1;
  }

  getTotalPagesMinusOne(): number {
    return this.totalPages - 1;
  }

  getShowingRange(): { start: number, end: number } {
    const start = (this.currentPage * this.pageSize) + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    return { start, end };
  }

  onSearch(event: any): void {
    const keyword = event.target.value;
    this.searchTerm = keyword;
    this.currentPage = 0;
    this.loadStudentResults();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadStudentResults();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'desc';
    }
    this.loadStudentResults();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStudentResults();
  }

  viewStudentDetails(sessionId: number): void {
    this.router.navigate(['/examiner/results/students', sessionId]);
  }

  viewAnalytics(sessionId: number): void {
    this.router.navigate(['/examiner/analytics', sessionId]);
  }

  exportResults(format: string = 'csv'): void {
    this.resultsService.exportResults(this.testId, format as any).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-results-test-${this.testId}.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.successMessage = `Results exported as ${format.toUpperCase()} successfully!`;
        this.clearMessageAfterDelay();
      },
      error: (error) => {
        this.errorMessage = 'Failed to export results';
        console.error('Error exporting results:', error);
        this.clearMessageAfterDelay();
      }
    });
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i + 1);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range to show around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 3);
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }

  getPageNumber(page: number | string): number {
  // If page is a number, subtract 1 to get zero-based index
  // If page is string (like '...'), return current page
  return typeof page === 'number' ? page - 1 : this.currentPage;
}

  getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  }

  getStatusBadge(status: string): string {
    if (!status) return 'bg-secondary';
    
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-success';
      case 'in-progress': return 'bg-warning';
      case 'graded': return 'bg-info';
      case 'submitted': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'warning';
      case 'F': return 'danger';
      default: return 'secondary';
    }
  }

  goBack(): void {
    this.router.navigate(['/examiner/test-results']);
  }

  calculatePassRate(): number {
    const passed = this.passedCount;
    return this.studentResults.length > 0 ? (passed / this.studentResults.length) * 100 : 0;
  }

  calculateAverageScore(): number {
    const scores = this.studentResults
      .filter(s => s.percentage !== null && s.percentage !== undefined)
      .map(s => s.percentage!);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000);
  }



  // Add these methods to your StudentResultsComponent class

getSortIcon(column: string): string {
  if (this.sortBy !== column) {
    return 'bi bi-arrow-down-up';
  }
  return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
}

getVisiblePages(): number[] {
  const totalPages = this.totalPages;
  const currentPage = this.currentPage;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 3, currentPage + delta); i++) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(0, 1, '...');
  } else {
    rangeWithDots.push(0, 1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 3) {
    rangeWithDots.push('...', totalPages - 2, totalPages - 1);
  } else {
    rangeWithDots.push(totalPages - 2, totalPages - 1);
  }

  return rangeWithDots.filter(page => page !== '...') as number[];
}

changePage(page: number): void {
  if (page >= 0 && page < this.totalPages) {
    this.currentPage = page;
    this.loadStudentResults();
  }
}

get startIndex(): number {
  return (this.currentPage * this.pageSize) + 1;
}

get endIndex(): number {
  return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
}


// Add these methods to your StudentResultsComponent

/** Check if any filters are active */
hasActiveFilters(): boolean {
  return !!this.searchTerm || this.statusFilter !== 'all' || 
         this.gradedFilter !== 'all' || this.minScore !== undefined || 
         this.maxScore !== undefined;
}

/** Set status filter and reload results */
setStatusFilter(status: string): void {
  this.statusFilter = status;
  this.currentPage = 0;
  this.loadStudentResults();
}

/** Clear search and reload */
clearSearch(): void {
  this.searchTerm = '';
  this.currentPage = 0;
  this.loadStudentResults();
}

/** Refresh results */
refreshResults(): void {
  this.loadStudentResults();
}

/** Get in-progress students count */
getInProgressCount(): number {
  return this.studentResults.filter(s => s.status === 'in-progress').length;
}

/** Get completion progress for a student */
getCompletionProgress(result: StudentExamResult): number {
  if (result.completed) return 100;
  if (result.status === 'in-progress') return 50;
  return 0;
}

/** Get status CSS class */
getStatusClass(status: string): string {
  if (!status) return 'status-not-started';
  
  switch (status.toLowerCase()) {
    case 'completed': return 'status-completed';
    case 'in-progress': return 'status-in-progress';
    default: return 'status-not-started';
  }
}

/** Handle page size change */
onPageSizeChange(): void {
  this.currentPage = 0;
  this.loadStudentResults();
}

/** Clear all filters */
clearFilters(): void {
  this.searchTerm = '';
  this.minScore = undefined;
  this.maxScore = undefined;
  this.statusFilter = 'all';
  this.gradedFilter = 'all';
  this.currentPage = 0;
  this.loadStudentResults();
}


}