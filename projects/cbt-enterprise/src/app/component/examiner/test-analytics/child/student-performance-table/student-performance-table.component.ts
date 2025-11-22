// components/student-performance-table.component.ts
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestAnalyticsService, StudentPerformanceParams } from '../../../../../service/test-analytics.service';

export interface StudentPerformance {
  studentId: string;
  name: string;
  score: number;
  timeSpent: number;
  status: 'completed' | 'in-progress' | 'not-started';
  submittedAt: string;
}

@Component({
  selector: 'app-student-performance-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="student-performance-table">
      <div class="table-header">
        <div class="header-main">
          <h4>Student Performance</h4>
          <span class="table-subtitle">
            {{ totalElements }} students • Page {{ currentPage + 1 }} of {{ totalPages }}
          </span>
        </div>
        
        <div class="header-controls">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" 
                   placeholder="Search students..." 
                   [(ngModel)]="searchTerm"
                   (input)="onSearchChange()">
          </div>
          
          <div class="filter-controls">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="onFilterChange()">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>

          <div class="page-size-selector">
            <label class="form-label-sm mb-0">Show:</label>
            <select class="form-select form-select-sm" 
                    [(ngModel)]="pageSize" 
                    (change)="onPageSizeChange()">
              <option *ngFor="let size of [5, 10, 20, 50]" [value]="size">{{ size }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="performance-table">
          <thead>
            <tr>
              <th (click)="sortBy('name')" class="sortable">
                Student
                <i class="bi" [class]="getSortIcon('name')"></i>
              </th>
              <th (click)="sortBy('score')" class="sortable text-center">
                Score
                <i class="bi" [class]="getSortIcon('score')"></i>
              </th>
              <th (click)="sortBy('timeSpent')" class="sortable text-center">
                Time Spent
                <i class="bi" [class]="getSortIcon('timeSpent')"></i>
              </th>
              <th (click)="sortBy('status')" class="sortable text-center">
                Status
                <i class="bi" [class]="getSortIcon('status')"></i>
              </th>
              <th (click)="sortBy('submittedAt')" class="sortable text-center">
                Submitted At
                <i class="bi" [class]="getSortIcon('submittedAt')"></i>
              </th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let student of students" 
                [class]="getStudentRowClass(student)">
              <td class="student-info">
                <div class="student-avatar">
                  {{ getInitials(student.name) }}
                </div>
                <div class="student-details">
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-id">{{ student.studentId }}</div>
                </div>
              </td>
              <td class="text-center">
                <span class="score-badge" [class]="getScoreClass(student.score)">
                  {{ student.score }}%
                </span>
              </td>
              <td class="text-center time-cell">
                {{ student.timeSpent }} min
              </td>
              <td class="text-center">
                <span class="status-badge" [class]="getStatusClass(student.status)">
                  {{ getStatusText(student.status) }}
                </span>
              </td>
              <td class="text-center">
                <span class="submission-time">
                  {{ formatSubmissionTime(student.submittedAt) }}
                </span>
              </td>
              <td class="text-center actions-cell">
                <button class="btn-action" title="View student details">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn-action" title="Download student report">
                  <i class="bi bi-download"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span>Loading students...</span>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="!isLoading && students.length === 0" class="empty-state">
          <i class="bi bi-people"></i>
          <p>No student data available</p>
        </div>
      </div>

      <!-- Pagination Section - Matching Test List Style -->
      <div *ngIf="students.length > 0" class="pagination-section">
        <div class="pagination-info">
          Showing <strong>{{ getStartIndex() }}</strong> to <strong>{{ getEndIndex() }}</strong>
          of <strong>{{ totalElements }}</strong> students
        </div>

        <nav class="pagination-nav">
          <ul class="pagination">
            <!-- First Page -->
            <li class="page-item" [class.disabled]="currentPage === 0">
              <a class="page-link" (click)="goToPage(0)" aria-label="First">
                <i class="bi bi-chevron-double-left"></i>
              </a>
            </li>

            <!-- Previous Page -->
            <li class="page-item" [class.disabled]="currentPage === 0">
              <a class="page-link" (click)="previousPage()" aria-label="Previous">
                <i class="bi bi-chevron-left"></i>
              </a>
            </li>

            <!-- Page Numbers -->
            <li *ngFor="let page of getVisiblePages()" class="page-item" [class.active]="page === currentPage">
              <a class="page-link" (click)="goToPage(page)">
                {{ page + 1 }}
              </a>
            </li>

            <!-- Next Page -->
            <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
              <a class="page-link" (click)="nextPage()" aria-label="Next">
                <i class="bi bi-chevron-right"></i>
              </a>
            </li>

            <!-- Last Page -->
            <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
              <a class="page-link" (click)="goToPage(totalPages - 1)" aria-label="Last">
                <i class="bi bi-chevron-double-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="table-footer">
        <div class="performance-summary">
          <div class="summary-item">
            <span class="label">Top Score:</span>
            <span class="value">{{ getTopScore() }}%</span>
          </div>
          <div class="summary-item">
            <span class="label">Avg Time:</span>
            <span class="value">{{ getAverageTime() }} min</span>
          </div>
          <div class="summary-item">
            <span class="label">Completion Rate:</span>
            <span class="value">{{ getCompletionRate() }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./student-performance-table.component.scss']
})
export class StudentPerformanceTableComponent implements OnInit, OnChanges {
  @Input() testId!: number;
  @Input() testTitle: string = '';
  @Input() dateRange: string = 'all';

  students: StudentPerformance[] = [];
  isLoading = false;

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filter properties
  searchTerm: string = '';
  statusFilter: string = 'all';

  // Sorting properties
  sortField = 'score';
  sortDirection = 'desc';

  private searchTimeout: any;

  constructor(private analyticsService: TestAnalyticsService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  ngOnChanges(): void {
    this.currentPage = 0; // Reset to first page when filters change
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    
    const params: StudentPerformanceParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortField,
      sortDirection: this.sortDirection,
      search: this.searchTerm,
      status: this.statusFilter !== 'all' ? this.statusFilter : undefined,
      dateRange: this.dateRange
    };

    this.analyticsService.getStudentPerformanceWithPagination(this.testId, params)
      .subscribe({
        next: (response) => {
          this.students = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.isLoading = false;
          // Fallback to empty array
          this.students = [];
        }
      });
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadStudents();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadStudents();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadStudents();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page when page size changes
    this.loadStudents();
  }

  // Get visible pages for pagination
  getVisiblePages(): number[] {
    const visiblePages = [];
    const totalVisible = 5; // Show 5 pages at most
    
    let startPage = Math.max(0, this.currentPage - Math.floor(totalVisible / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + totalVisible - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < totalVisible) {
      startPage = Math.max(0, endPage - totalVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    return visiblePages;
  }

  // Filter methods with debounce for search
  onSearchChange(): void {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Set new timeout for debounce
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadStudents();
    }, 300);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadStudents();
  }

  // Sorting methods
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.loadStudents();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  // Utility methods
  getStartIndex(): number {
    return (this.currentPage * this.pageSize) + 1;
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  getInitials(name: string): string {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusText(status: string): string {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getStudentRowClass(student: StudentPerformance): string {
    if (student.score >= 90) return 'row-top-performer';
    if (student.score < 50) return 'row-needs-attention';
    return '';
  }

  formatSubmissionTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', minute: '2-digit' 
    });
  }

  getTopScore(): number {
    if (!this.students.length) return 0;
    return Math.max(...this.students.map(s => s.score));
  }

  getAverageTime(): number {
    if (!this.students.length) return 0;
    const completed = this.students.filter(s => s.status === 'completed');
    if (!completed.length) return 0;
    const total = completed.reduce((sum, student) => sum + student.timeSpent, 0);
    return Math.round(total / completed.length);
  }

  getCompletionRate(): number {
    if (!this.students.length) return 0;
    const completed = this.students.filter(s => s.status === 'completed').length;
    return Math.round((completed / this.students.length) * 100);
  }
}