import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../service/exam.servise';

export interface QuestionResult {
  questionId: number;
  questionText: string;
  questionType: string;
  studentAnswer: string;
  correctAnswer: string;
  score: number;
  maxMarks: number;
  isCorrect: boolean;
}

export interface ExamResult {
  sessionId: number;
  examId: number;
  examName: string;
  studentId: number;
  studentName: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  timeSpent: string;
  completedAt: Date;
  passingScore: number;
  status: 'PASS' | 'FAIL';
  questionResults: QuestionResult[];
}

@Component({
  selector: 'app-exam-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss']
})
export class ExamResultsComponent implements OnInit {
  examResult: ExamResult | null = null;
  loading = true;
  error = '';
  sessionId!: number;

  // Configuration - No more hardcoded values in template
 readonly config = {
  passingScore: 70,
  scoreRanges: {
    excellent: 90,
    good: 80,
    average: 60,
    poor: 0
  },
  icons: {
    pass: 'bi-check-circle-fill',
    fail: 'bi-x-circle-fill', 
    loading: 'bi-arrow-repeat',
    error: 'bi-exclamation-triangle-fill',
    success: 'bi-check-circle-fill',
    warning: 'bi-exclamation-triangle-fill'
  },
  messages: {
    loading: 'Loading your exam results...',
    errorRetry: 'Try Again',
    congratulations: 'Congratulations!',
    keepPracticing: 'Keep Practicing!',
    noWeakAreas: 'No specific weak areas identified',
    improvementNeeded: 'Need improvement in {type} questions ({count} incorrect)',
    unansweredWarning: 'Complete all questions ({count} unanswered)'
  }
};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = +params['sessionId'];
      this.loadExamResults();
    });
  }

  loadExamResults(): void {
    this.loading = true;
    this.error = '';

    this.examService.getImmediateResults(this.sessionId).subscribe({
      next: (response) => {
        if (response.resultsStatus === 'READY' && response.results) {
          this.processResults(response.results);
        } else if (response.gradingStatus) {
          this.error = this.getGradingStatusMessage(response.gradingStatus);
        } else {
          this.error = 'Results are not ready yet. Please check back later.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loadResultsTraditional();
      }
    });
  }

  private getGradingStatusMessage(gradingStatus: any): string {
    if (gradingStatus.pendingEssays > 0) {
      return `${gradingStatus.pendingEssays} essay questions are being graded. Please check back later.`;
    }
    return 'Results are being processed. Please wait...';
  }

  private loadResultsTraditional(): void {
    this.examService.getExamResults(this.sessionId).subscribe({
      next: (examData) => {
        this.examService.getExamAnswers(this.sessionId).subscribe({
          next: (answers) => {
            this.processResults(examData, answers);
            this.loading = false;
          },
          error: (err) => this.handleError('Failed to load answer details')
        });
      },
      error: (err) => this.handleError('Failed to load exam results')
    });
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    console.error(message);
  }

  private processResults(examData: any, answers?: any[]): void {
    if (answers) {
      const questionResults = this.buildQuestionResults(answers);
      const totalScore = questionResults.reduce((sum, q) => sum + q.score, 0);
      const maxPossibleScore = questionResults.reduce((sum, q) => sum + q.maxMarks, 0);
      const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      this.examResult = {
        sessionId: examData.sessionId,
        examId: examData.examId,
        examName: examData.examName,
        studentId: examData.studentId,
        studentName: examData.studentName,
        totalScore,
        maxPossibleScore,
        percentage: Math.round(percentage * 100) / 100,
        timeSpent: this.calculateTimeSpent(examData.startTime, examData.endTime),
        completedAt: new Date(examData.endTime),
        passingScore: examData.passingScore || this.config.passingScore,
        status: percentage >= (examData.passingScore || this.config.passingScore) ? 'PASS' : 'FAIL',
        questionResults
      };
    } else {
      this.examResult = {
        sessionId: examData.sessionId,
        examId: examData.examId,
        examName: examData.testTitle,
        studentId: examData.studentId,
        studentName: examData.studentName,
        totalScore: examData.score,
        maxPossibleScore: examData.totalMarks,
        percentage: examData.percentage,
        timeSpent: `${examData.timeSpent}m`,
        completedAt: examData.endTime,
        passingScore: examData.passingScore || this.config.passingScore,
        status: examData.passed ? 'PASS' : 'FAIL',
        questionResults: examData.questionResults || []
      };
    }
  }

  private buildQuestionResults(answers: any[]): QuestionResult[] {
    return answers.map(answer => ({
      questionId: answer.question.id,
      questionText: answer.question.text,
      questionType: answer.question.type,
      studentAnswer: answer.answer || 'Not answered',
      correctAnswer: answer.question.correctAnswer,
      score: answer.score || 0,
      maxMarks: answer.question.maxMarks,
      isCorrect: (answer.score || 0) === answer.question.maxMarks
    }));
  }

  private calculateTimeSpent(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  }

  // UI Helper Methods
  getScoreColor(percentage: number): string {
    if (percentage >= this.config.scoreRanges.excellent) return 'excellent';
    if (percentage >= this.config.scoreRanges.good) return 'good';
    if (percentage >= this.config.scoreRanges.average) return 'average';
    return 'poor';
  }

  getStatusIcon(status: 'PASS' | 'FAIL'): string {
    return status === 'PASS' ? this.config.icons.pass : this.config.icons.fail;
  }

  getStatusClass(status: 'PASS' | 'FAIL'): string {
    return status === 'PASS' ? 'status-pass' : 'status-fail';
  }

  getQuestionTypeClass(type: string): string {
    return `type-${type.toLowerCase().replace('_', '-')}`;
  }

  // Actions
  retakeExam(): void {
    if (this.examResult) {
      this.router.navigate(['/exam-instructions', this.examResult.examId]);
    }
  }

  backToDashboard(): void {
    this.router.navigate(['/student-dashboard']);
  }

  downloadResults(): void {
    window.print();
  }

  // Computed Properties
  get correctAnswers(): number {
    return this.examResult?.questionResults.filter(q => q.isCorrect).length || 0;
  }

  get incorrectAnswers(): number {
    return this.examResult?.questionResults.filter(q => !q.isCorrect && q.score > 0).length || 0;
  }

  get unansweredQuestions(): number {
    return this.examResult?.questionResults.filter(q => q.score === 0).length || 0;
  }

  get totalQuestions(): number {
    return this.examResult?.questionResults.length || 0;
  }

  identifyWeakAreas(): string[] {
    if (!this.examResult) return [this.config.messages.noWeakAreas];
    
    const weakAreas: string[] = [];
    const incorrectQuestions = this.examResult.questionResults.filter(q => !q.isCorrect);
    
    const typeCounts: {[key: string]: number} = {};
    incorrectQuestions.forEach(q => {
      typeCounts[q.questionType] = (typeCounts[q.questionType] || 0) + 1;
    });
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > 1) {
        weakAreas.push(
          this.config.messages.improvementNeeded
            .replace('{type}', type)
            .replace('{count}', count.toString())
        );
      }
    });
    
    if (this.unansweredQuestions > 0) {
      weakAreas.push(
        this.config.messages.unansweredWarning
          .replace('{count}', this.unansweredQuestions.toString())
      );
    }
    
    return weakAreas.length > 0 ? weakAreas : [this.config.messages.noWeakAreas];
  }

getScoreColorClass(percentage: number): string {
  if (percentage >= 90) return 'bg-excellent text-excellent';
  if (percentage >= 80) return 'bg-good text-good';
  if (percentage >= 60) return 'bg-average text-average';
  return 'bg-poor text-poor';
}

getPerformanceLevel(percentage: number): string {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Good';
  if (percentage >= 60) return 'Average';
  return 'Needs Improvement';
}

  
getPerformanceBadgeClass(percentage: number): string {
  if (percentage >= 90) return 'bg-success';
  if (percentage >= 80) return 'bg-info';
  if (percentage >= 60) return 'bg-warning';
  return 'bg-danger';
}


formatQuestionType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'MULTIPLE_CHOICE': 'MCQ',
    'TRUE_FALSE': 'True/False',
    'ESSAY': 'Essay',
    'FILL_IN_THE_BLANK': 'Fill Blank'
  };
  return typeMap[type] || type;
}

}