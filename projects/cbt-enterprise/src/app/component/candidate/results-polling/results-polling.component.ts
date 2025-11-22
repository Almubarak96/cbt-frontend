import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExamService, GradingStatus, ImmediateResultsResponse } from '../../../service/exam.servise';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-results-polling',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body text-center py-5">
              <!-- Loading State -->
              <div *ngIf="currentStatus === 'LOADING'" class="loading-section">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                <h4>Processing Your Exam</h4>
                <p>We're calculating your results...</p>
                
                <!-- Manual Trigger Button -->
                <div class="mt-3" *ngIf="elapsedTime > 5">
                  <button class="btn btn-sm btn-outline-primary" (click)="triggerImmediateGrading()">
                    <i class="bi bi-lightning me-1"></i>Get Results Now
                  </button>
                  <small class="d-block text-muted mt-1">If results are taking too long</small>
                </div>
                
                <div class="progress mt-3">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" 
                       [style.width]="progress + '%'"></div>
                </div>
                <p class="text-muted mt-2">Time elapsed: {{ elapsedTime }} seconds</p>
              </div>

              <!-- Essay Grading State -->
              <div *ngIf="currentStatus === 'ESSAY_GRADING'" class="essay-grading-section">
                <div class="spinner-border text-warning mb-3" style="width: 3rem; height: 3rem;"></div>
                <h4>Essay Questions Being Graded</h4>
                <p>Your essay answers are being reviewed by instructors...</p>
                
                <div class="grading-progress mt-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Essay Grading Progress:</span>
                    <span>{{ gradingStatus?.gradedEssays }}/{{ gradingStatus?.essayQuestions }} graded</span>
                  </div>
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-warning" 
                         [style.width]="(gradingStatus?.completionPercentage || 0) + '%'">
                      {{ (gradingStatus?.completionPercentage || 0) | number:'1.0-0' }}%
                    </div>
                  </div>
                </div>

                <div class="mt-3 text-muted">
                  <small>
                    This may take a few minutes. You can close this page and check back later.
                  </small>
                </div>
              </div>

              <!-- Results Ready -->
              <div *ngIf="currentStatus === 'RESULTS_READY'" class="results-ready-section">
                <div class="alert alert-success">
                  <i class="bi bi-check-circle me-2"></i>
                  Results Are Ready!
                </div>
                <button class="btn btn-success btn-lg" (click)="viewResults()">
                  <i class="bi bi-graph-up me-2"></i>View Detailed Results
                </button>
              </div>

              <!-- Timeout State -->
              <div *ngIf="currentStatus === 'TIMEOUT'" class="timeout-section">
                <div class="alert alert-warning">
                  <i class="bi bi-clock-history me-2"></i>
                  Results Taking Longer Than Expected
                </div>
                <p class="mb-3">Your results are still being processed.</p>
                
                <div class="grading-info mb-4" *ngIf="gradingStatus">
                  <div class="row text-start">
                    <div class="col-md-6">
                      <strong>Total Questions:</strong> {{ gradingStatus.totalQuestions }}
                    </div>
                    <div class="col-md-6">
                      <strong>Essay Questions:</strong> {{ gradingStatus.essayQuestions }}
                    </div>
                    <div class="col-md-6">
                      <strong>Graded Essays:</strong> {{ gradingStatus.gradedEssays }}
                    </div>
                    <div class="col-md-6">
                      <strong>Pending Essays:</strong> {{ gradingStatus.pendingEssays }}
                    </div>
                  </div>
                </div>

                <div class="action-buttons">
                  <button class="btn btn-primary me-2" (click)="triggerImmediateGrading()">
                    <i class="bi bi-lightning me-2"></i>Force Results Now
                  </button>
                  <button class="btn btn-outline-secondary me-2" (click)="continueWaiting()">
                    <i class="bi bi-arrow-clockwise me-2"></i>Continue Waiting
                  </button>
                  <button class="btn btn-outline-secondary" (click)="goToDashboard()">
                    <i class="bi bi-house me-2"></i>Check Back Later
                  </button>
                </div>
              </div>

              <!-- Error State -->
              <div *ngIf="currentStatus === 'ERROR'" class="error-section">
                <div class="alert alert-danger">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>
                <button class="btn btn-primary me-2" (click)="retry()">
                  <i class="bi bi-arrow-clockwise me-2"></i>Try Again
                </button>
                <button class="btn btn-outline-secondary me-2" (click)="triggerImmediateGrading()">
                  <i class="bi bi-lightning me-2"></i>Force Grading
                </button>
                <button class="btn btn-outline-secondary" (click)="goToDashboard()">
                  <i class="bi bi-house me-2"></i>Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-section, .essay-grading-section, .results-ready-section, 
    .timeout-section, .error-section {
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .progress {
      height: 20px;
      width: 100%;
      max-width: 300px;
    }
    .grading-progress {
      width: 100%;
      max-width: 400px;
    }
    .grading-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
    }
    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `]
})
export class ResultsPollingComponent implements OnInit, OnDestroy {
  sessionId!: number;
  currentStatus: 'LOADING' | 'ESSAY_GRADING' | 'RESULTS_READY' | 'TIMEOUT' | 'ERROR' = 'LOADING';
  gradingStatus: GradingStatus | null = null;
  progress: number = 0;
  elapsedTime: number = 0;
  errorMessage: string = '';
  
  private pollingSubscription!: Subscription;
  private timerSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = +params['sessionId'];
      this.startSimplePolling();
      this.startTimer();
    });
  }

  startSimplePolling(): void {
    this.pollingSubscription = this.examService
      .smartResultsPolling(this.sessionId)
      .subscribe({
        next: (response: ImmediateResultsResponse) => {
          console.log('Polling response:', response);
          
          // SIMPLIFIED LOGIC - Just handle READY vs everything else
          if (response.status === 'READY') {
            this.currentStatus = 'RESULTS_READY';
            this.stopPolling();
          } else {
            // For any other status, check if we need to show essay grading
            if (response.gradingStatus && response.gradingStatus.essayQuestions > 0) {
              this.currentStatus = 'ESSAY_GRADING';
              this.gradingStatus = response.gradingStatus;
            } else {
              this.currentStatus = 'LOADING';
            }
          }
          
          this.updateProgress();
        },
        error: (err) => {
          console.error('Polling error:', err);
          this.currentStatus = 'ERROR';
          this.errorMessage = 'Failed to check results status. Please try again.';
        }
      });
  }

  triggerImmediateGrading(): void {
    this.currentStatus = 'LOADING';
    this.errorMessage = '';
    
    this.examService.triggerGrading(this.sessionId).subscribe({
      next: () => {
        console.log('Manual grading triggered successfully');
        // Restart polling after a brief delay to let grading complete
        setTimeout(() => {
          this.retry();
        }, 1500);
      },
      error: (err) => {
        console.error('Error triggering grading:', err);
        this.errorMessage = 'Failed to trigger grading. Please try again.';
        this.currentStatus = 'ERROR';
      }
    });
  }

  startTimer(): void {
    this.timerSubscription = this.examService.startTimer(1000).subscribe(() => {
      this.elapsedTime++;
      this.updateProgress();
      
      // Auto-timeout after 60 seconds
      if (this.elapsedTime >= 60 && this.currentStatus === 'LOADING') {
        this.currentStatus = 'TIMEOUT';
      }
    });
  }

  updateProgress(): void {
    // Simple progress calculation based on elapsed time
    if (this.elapsedTime < 10) {
      this.progress = (this.elapsedTime / 10) * 50; // 0-50% in first 10 seconds
    } else if (this.elapsedTime < 30) {
      this.progress = 50 + ((this.elapsedTime - 10) / 20) * 30; // 50-80% in next 20 seconds
    } else {
      this.progress = 80 + ((this.elapsedTime - 30) / 30) * 20; // 80-100% in next 30 seconds
    }
    
    // Cap at 99% until results are ready
    if (this.currentStatus !== 'RESULTS_READY') {
      this.progress = Math.min(99, this.progress);
    } else {
      this.progress = 100;
    }
  }

  viewResults(): void {
    this.router.navigate(['/student/exam-results', this.sessionId]);
  }

  continueWaiting(): void {
    this.currentStatus = 'LOADING';
    this.startSimplePolling();
  }

  retry(): void {
    this.currentStatus = 'LOADING';
    this.errorMessage = '';
    this.elapsedTime = 0;
    this.progress = 0;
    this.stopPolling();
    this.startSimplePolling();
    this.startTimer();
  }

  goToDashboard(): void {
    this.router.navigate(['/student-dashboard']);
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}