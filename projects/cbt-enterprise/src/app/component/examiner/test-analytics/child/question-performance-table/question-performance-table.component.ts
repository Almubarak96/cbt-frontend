// components/question-performance-table.component.ts
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionAnalysisParams, TestAnalyticsService } from '../../../../../service/test-analytics.service';

export interface QuestionAnalysis {
  questionId: number;
  text: string;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  difficulty: string;
}

@Component({
  selector: 'app-question-performance-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="question-performance-table">
      <div class="table-header">
        <div class="header-main">
          <h4>Question Performance Analysis</h4>
          <span class="table-subtitle">
            {{ totalElements }} questions • Page {{ currentPage + 1 }} of {{ totalPages }}
          </span>
        </div>
        
        <div class="header-controls">
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
              <th (click)="sortBy('questionId')" class="sortable">
                Question
                <i class="bi" [class]="getSortIcon('questionId')"></i>
              </th>
              <th (click)="sortBy('correctAnswers')" class="sortable text-center">
                Correct
                <i class="bi" [class]="getSortIcon('correctAnswers')"></i>
              </th>
              <th (click)="sortBy('incorrectAnswers')" class="sortable text-center">
                Incorrect
                <i class="bi" [class]="getSortIcon('incorrectAnswers')"></i>
              </th>
              <th (click)="sortBy('accuracy')" class="sortable text-center">
                Accuracy
                <i class="bi" [class]="getSortIcon('accuracy')"></i>
              </th>
              <th (click)="sortBy('averageTime')" class="sortable text-center">
                Avg Time
                <i class="bi" [class]="getSortIcon('averageTime')"></i>
              </th>
              <th (click)="sortBy('difficulty')" class="sortable text-center">
                Difficulty
                <i class="bi" [class]="getSortIcon('difficulty')"></i>
              </th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let question of questions" 
                [class]="getQuestionRowClass(question)">
              <td class="question-text">
                <div class="question-content">
                  <span class="question-id">Q{{ question.questionId }}</span>
                  <span class="question-preview">{{ getQuestionPreview(question.text) }}</span>
                </div>
              </td>
              <td class="text-center correct-count">
                {{ question.correctAnswers }}
              </td>
              <td class="text-center incorrect-count">
                {{ question.incorrectAnswers }}
              </td>
              <td class="text-center">
                <span class="accuracy-badge" [class]="getAccuracyClass(question)">
                  {{ getAccuracy(question) | number:'1.1-1' }}%
                </span>
              </td>
              <td class="text-center time-cell">
                {{ question.averageTime | number:'1.0-0' }}s
              </td>
              <td class="text-center">
                <span class="difficulty-badge" [class]="getDifficultyClass(question.difficulty)">
                  {{ getDifficultyText(question.difficulty) }}
                </span>
              </td>
              <td class="text-center actions-cell">
                <button class="btn-action" title="View question details">
                  <i class="bi bi-eye"></i>
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
          <span>Loading questions...</span>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="!isLoading && questions.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No question data available</p>
        </div>
      </div>

      <!-- Pagination Section - Matching Test List Style -->
      <div *ngIf="questions.length > 0" class="pagination-section">
        <div class="pagination-info">
          Showing <strong>{{ getStartIndex() }}</strong> to <strong>{{ getEndIndex() }}</strong>
          of <strong>{{ totalElements }}</strong> questions
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

      <div class="table-summary">
        <div class="summary-stats">
          <div class="summary-item">
            <span class="label">Most Difficult:</span>
            <span class="value">Q{{ getMostDifficultQuestion()?.questionId || 'N/A' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Easiest:</span>
            <span class="value">Q{{ getEasiestQuestion()?.questionId || 'N/A' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Avg Accuracy:</span>
            <span class="value">{{ getAverageAccuracy() | number:'1.1-1' }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./question-performance-table.component.scss']
})
export class QuestionPerformanceTableComponent implements OnInit, OnChanges {
  @Input() testId!: number;
  @Input() testTitle: string = '';
  @Input() dateRange: string = 'all';

  questions: QuestionAnalysis[] = [];
  isLoading = false;

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Sorting properties
  sortField = 'accuracy';
  sortDirection = 'desc';

  constructor(private analyticsService: TestAnalyticsService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngOnChanges(): void {
    this.currentPage = 0; // Reset to first page when filters change
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    
    const params: QuestionAnalysisParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortField,
      sortDirection: this.sortDirection,
      dateRange: this.dateRange
    };

    this.analyticsService.getQuestionAnalysisWithPagination(this.testId, params)
      .subscribe({
        next: (response) => {
          this.questions = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading questions:', error);
          this.isLoading = false;
          // Fallback to empty array
          this.questions = [];
        }
      });
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadQuestions();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadQuestions();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadQuestions();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page when page size changes
    this.loadQuestions();
  }

  // Get visible pages for pagination (similar to test list)
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

  // Sorting methods
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.loadQuestions();
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

  getQuestionPreview(text: string): string {
    const maxLength = 60;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getAccuracy(question: QuestionAnalysis): number {
    const total = question.correctAnswers + question.incorrectAnswers;
    return total > 0 ? (question.correctAnswers / total) * 100 : 0;
  }

  getAccuracyClass(question: QuestionAnalysis): string {
    const accuracy = this.getAccuracy(question);
    if (accuracy >= 80) return 'accuracy-high';
    if (accuracy >= 60) return 'accuracy-medium';
    return 'accuracy-low';
  }

  getQuestionRowClass(question: QuestionAnalysis): string {
    const accuracy = this.getAccuracy(question);
    if (accuracy < 40) return 'row-low-accuracy';
    if (accuracy > 90) return 'row-high-accuracy';
    return '';
  }

  getDifficultyClass(difficulty: string): string {
    return `difficulty-${difficulty.toLowerCase()}`;
  }

  getDifficultyText(difficulty: string): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }

  getMostDifficultQuestion(): QuestionAnalysis | null {
    if (!this.questions.length) return null;
    return this.questions.reduce((prev, current) => 
      this.getAccuracy(prev) < this.getAccuracy(current) ? prev : current
    );
  }

  getEasiestQuestion(): QuestionAnalysis | null {
    if (!this.questions.length) return null;
    return this.questions.reduce((prev, current) => 
      this.getAccuracy(prev) > this.getAccuracy(current) ? prev : current
    );
  }

  getAverageAccuracy(): number {
    if (!this.questions.length) return 0;
    const totalAccuracy = this.questions.reduce((sum, question) => 
      sum + this.getAccuracy(question), 0
    );
    return totalAccuracy / this.questions.length;
  }
}