import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EssayGradingStats, ManualGradingRequest, ManualGradingService, StudentEssayAnswer } from '../../../service/manual-grading.service';
import { EssayViewerComponent } from "../essay-viewer/essay-viewer.component";

// Update the interface to make completionPercentage optional
export interface StudentEssayGroup {
  studentId: number;
  studentName: string;
  studentEmail: string;
  essays: StudentEssayAnswer[];
  gradedCount: number;
  totalCount: number;
  completionPercentage?: number; // Make this optional
  expanded?: boolean; // For UI state
}

@Component({
  selector: 'app-essay-grading',
  standalone: true,
  imports: [CommonModule, FormsModule, EssayViewerComponent],
  templateUrl: './manual-grading.component.html',
  styleUrls: ['./manual-grading.component.scss']
})
export class ManualGradingComponent implements OnInit {
  testId!: number;
  essays: StudentEssayAnswer[] = [];
  groupedEssays: StudentEssayGroup[] = [];
  selectedEssay?: StudentEssayAnswer;
  selectedEssayGradingStatus: any = null;
  currentScore: number = 0;
  feedback: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  // Filters & View
  filter: 'all' | 'ungraded' | 'graded' = 'ungraded';
  showGroupedView: boolean = true; // Default to grouped view
  stats: EssayGradingStats = { gradedEssays: 0, ungradedEssays: 0, totalEssays: 0 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manualGradingService: ManualGradingService
  ) { }

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
    this.loadGradingStats();
    this.loadEssays();
  }

  loadGradingStats(): void {
    this.manualGradingService.getGradingStats(this.testId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading grading stats:', error);
      }
    });
  }

  loadEssays(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.showGroupedView) {
      // Load grouped essays
      this.manualGradingService.getEssaysGroupedByStudent(this.testId).subscribe({
        next: (groups) => {
          this.groupedEssays = groups.map(group => ({
            ...group,
            completionPercentage: this.calculateCompletionPercentage(group),
            expanded: false // Initially collapse all groups
          }));
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load grouped essays';
          this.isLoading = false;
          console.error('Error loading grouped essays:', error);
          
          // Fallback: load individual essays if grouped fails
          this.showGroupedView = false;
          this.loadIndividualEssays();
        }
      });
    } else {
      this.loadIndividualEssays();
    }
  }

  private loadIndividualEssays(): void {
    const serviceCall = this.filter === 'ungraded'
      ? this.manualGradingService.getUngradedEssays(this.testId, this.currentPage, this.pageSize)
      : this.manualGradingService.getAllEssays(this.testId, this.currentPage, this.pageSize);

    serviceCall.subscribe({
      next: (response) => {
        this.essays = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load essays';
        this.isLoading = false;
        console.error('Error loading essays:', error);
      }
    });
  }

  private calculateCompletionPercentage(group: StudentEssayGroup): number {
    if (group.totalCount === 0) return 0;
    return (group.gradedCount / group.totalCount) * 100;
  }

  selectEssay(essay: StudentEssayAnswer): void {
    this.selectedEssay = essay;
    this.currentScore = essay.currentScore || 0;
    this.feedback = essay.graderFeedback || '';
    this.errorMessage = '';
    this.successMessage = '';

    // Load grading status for the selected essay's session
    this.loadEssayGradingStatus(essay.sessionId);
  }

  loadEssayGradingStatus(sessionId: number): void {
    this.manualGradingService.getExamGradingStatus(sessionId).subscribe({
      next: (status) => {
        this.selectedEssayGradingStatus = status;
      },
      error: (error) => {
        console.error('Error loading grading status:', error);
        // Set default status if API fails
        this.selectedEssayGradingStatus = {
          allEssaysGraded: false,
          totalScore: 0
        };
      }
    });
  }

  // Update header stats immediately after grading
  private updateHeaderStats(): void {
    if (this.selectedEssay?.graded) {
      this.stats = {
        ...this.stats,
        gradedEssays: this.stats.gradedEssays + 1,
        ungradedEssays: Math.max(0, this.stats.ungradedEssays - 1)
      };
    }
  }

  // Update grouped essays after grading
  private updateGroupedEssays(): void {
    if (!this.selectedEssay) return;

    // Find and update the group containing this essay
    this.groupedEssays.forEach(group => {
      if (group.studentId === this.selectedEssay!.studentId) {
        const essayIndex = group.essays.findIndex(e =>
          e.sessionId === this.selectedEssay!.sessionId &&
          e.questionId === this.selectedEssay!.questionId
        );
        
        if (essayIndex !== -1) {
          // Update the essay in the group
          group.essays[essayIndex] = { ...this.selectedEssay! };
          
          // Recalculate group stats
          group.gradedCount = group.essays.filter(e => e.graded).length;
          group.completionPercentage = this.calculateCompletionPercentage(group);
        }
      }
    });
  }

  submitGrade(): void {
    if (!this.selectedEssay) return;

    if (this.currentScore < 0 || this.currentScore > this.selectedEssay.maxMarks) {
      this.errorMessage = `Score must be between 0 and ${this.selectedEssay.maxMarks}`;
      return;
    }

    this.isLoading = true;
    const request: ManualGradingRequest = {
      sessionId: this.selectedEssay.sessionId,
      questionId: this.selectedEssay.questionId,
      score: this.currentScore,
      feedback: this.feedback,
      graderId: 1 // This should come from auth service
    };

    this.manualGradingService.gradeEssay(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Essay graded successfully!';

          // Update the selected essay
          this.selectedEssay!.currentScore = response.awardedScore;
          this.selectedEssay!.graded = true;
          this.selectedEssay!.graderFeedback = this.feedback;

          // Update header stats IMMEDIATELY
          this.updateHeaderStats();

          // Update local lists
          if (this.showGroupedView) {
            this.updateGroupedEssays();
          } else {
            // Update individual essays list
            const index = this.essays.findIndex(e =>
              e.sessionId === this.selectedEssay!.sessionId &&
              e.questionId === this.selectedEssay!.questionId
            );
            if (index !== -1) {
              this.essays[index] = { ...this.selectedEssay! };
            }

            // If filtering ungraded, remove from list
            if (this.filter === 'ungraded') {
              this.essays = this.essays.filter(e =>
                !(e.sessionId === this.selectedEssay!.sessionId &&
                  e.questionId === this.selectedEssay!.questionId)
              );
            }
          }

          // Reload stats from server for accuracy
          this.loadGradingStats();

          // Reload grading status
          this.loadEssayGradingStatus(this.selectedEssay!.sessionId);

        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to submit grade';
        this.isLoading = false;
        console.error('Error grading essay:', error);
      }
    });
  }

  // Toggle between grouped and individual views
  toggleGroupedView(): void {
    this.showGroupedView = !this.showGroupedView;
    this.currentPage = 0; // Reset pagination when switching views
    this.clearSelection();
    this.loadEssays();
  }

  // Toggle group expansion
  toggleGroup(group: StudentEssayGroup): void {
    group.expanded = !group.expanded;
  }

  // Expand all groups
  expandAllGroups(): void {
    this.groupedEssays.forEach(group => group.expanded = true);
  }

  // Collapse all groups
  collapseAllGroups(): void {
    this.groupedEssays.forEach(group => group.expanded = false);
  }

  // Filter methods
  setFilter(filterType: 'all' | 'ungraded' | 'graded'): void {
    this.filter = filterType;
    this.currentPage = 0;
    if (!this.showGroupedView) {
      this.loadEssays();
    }
    // For grouped view, we show all essays and filter is handled by expansion
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEssays();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    if (!this.showGroupedView) {
      this.loadEssays();
    }
  }

  // Refresh everything
  refreshEssays(): void {
    this.loadGradingStats();
    this.loadEssays();
    if (this.selectedEssay) {
      this.loadEssayGradingStatus(this.selectedEssay.sessionId);
    }
  }

  // Utility methods
  getScoreColor(score: number, maxMarks: number): string {
    const percentage = (score / maxMarks) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  }

  get startIndex(): number {
    return (this.currentPage * this.pageSize) + 1;
  }

  get endIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 0; i < 5; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 4) {
        pages.push(0);
        pages.push(-1); // Ellipsis
        for (let i = totalPages - 5; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push(-1); // Ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages - 1);
      }
    }

    return pages;
  }

  getTextLength(htmlContent: string | undefined): number {
    if (!htmlContent) return 0;

    // Strip HTML tags to get actual text length
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent?.length || 0;
  }

  getPlainText(htmlContent: string | undefined): string {
    if (!htmlContent) return '';

    // Strip HTML tags to get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  clearSelection(): void {
    this.selectedEssay = undefined;
    this.selectedEssayGradingStatus = null;
    this.currentScore = 0;
    this.feedback = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Get completion percentage for progress bars (with fallback)
  getCompletionPercentage(group: StudentEssayGroup): number {
    return group.completionPercentage || this.calculateCompletionPercentage(group);
  }

  // Check if all essays in a group are graded
  isGroupComplete(group: StudentEssayGroup): boolean {
    return group.gradedCount === group.totalCount;
  }

  // Safe method to get grading status property
  getGradingStatusProperty(property: string): any {
    return this.selectedEssayGradingStatus ? this.selectedEssayGradingStatus[property] : null;
  }
}