// test-session.component.ts
import { Component, OnInit, ViewChild, HostListener, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { QuillModule } from 'ngx-quill';

// Models and Services
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MediaType, QuestionDTO, QuestionType } from '../../../models/question.dto';
import { AnswerDTO } from '../../../models/answer.dto';
import { ExamService } from '../../../service/exam.service';

// Pipes and Components
import { CountdownPipe } from "../../../pipes/countdown.pipe";
import { TestInstructionsComponent } from '../test-instructions/test-instructions.component';
import { WebcamCaptureComponent } from '../../proctor/webcam-capture/webcam-capture.component';
import { CalculatorComponent } from "../../calculator/calculator.component";
import { ProctoringWidgetComponent } from "../../proctor/proctoring-widget/proctoring-widget.component";
import { CustomModalComponent } from "../../shared/custom-modal/custom-modal.component";

// Services
import { ModalService } from '../../../services/modal.service';

/**
 * Enhanced Test Session Component
 * Features:
 * - Custom modals instead of browser alerts
 * - Optimized Quill editor for essays
 * - Screen height optimization to minimize scrolling
 * - Full keyboard navigation
 * - Comprehensive error handling
 * - Full documentation and comments
 */
@Component({
  selector: 'app-test-session',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CountdownPipe,
    WebcamCaptureComponent,
    TestInstructionsComponent,
    QuillModule,
    CalculatorComponent,
    ProctoringWidgetComponent,
    CustomModalComponent
  ],
  templateUrl: './test-session.component.html',
  styleUrls: ['./test-session.component.scss']
})
export class TestSession implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(WebcamCaptureComponent) webcamCapture!: WebcamCaptureComponent;
  @ViewChild(TestInstructionsComponent) instructionsModal!: TestInstructionsComponent;
  @ViewChild('questionContent') questionContent!: ElementRef;

  // Current test session data
  currentTestId!: number;
  sessionId!: any;
  page = 0;
  size = 1;
  totalPages = 0;
  questions: (QuestionDTO & { choicesArray: string[]; savedAnswer: string })[] = [];
  answers: AnswerDTO[] = [];
  allQuestionIds: { id: number; answered: boolean; }[] = [];
  
  // Timer and session management
  timeLeft = 0;
  totalDuration!: number;
  stompClient!: Client;
  autoSaveInterval: any;
  showInstructionsModal = false;

  // UI State
  currentFilter: QuestionType | null = null;
  groupedQuestionMap: { [key: string]: { questionId: number; answered: boolean; type: string; number: number }[] } = {};

  // Screen optimization
  screenHeight!: number;
  contentMaxHeight!: string;

  // Enhanced Quill Configuration
  quillConfig = {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link']
      ]
    },
    placeholder: 'Type your essay answer here...',
    bounds: document.body
  };

  // Keyboard navigation
  private isKeyboardEnabled = true;
  private keyPressTimeout: any;

  // Modal references
  private questionMapModal: any;
  private calculatorOffcanvas: any;

  // Question Type Enum (for template access)
  QuestionType = QuestionType;

  constructor(
    private examService: ExamService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: ModalService
  ) {
    this.calculateScreenDimensions();
  }

  /**
   * Initialize component and subscribe to route parameters
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentTestId = +params['testId'];

      if (!this.currentTestId || isNaN(this.currentTestId)) {
        this.showErrorModal('Invalid Test', 'The test you are trying to access is invalid. Please contact your instructor.');
        return;
      }

      this.checkInstructionsStatus();
    });

    // Listen to window resize for responsive design
    window.addEventListener('resize', this.calculateScreenDimensions.bind(this));
  }

  /**
   * Initialize modal references after view initialization
   */
  ngAfterViewInit(): void {
    this.initializeModalReferences();
  }

  /**
   * Cleanup resources on component destruction
   */
  ngOnDestroy(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    if (this.keyPressTimeout) {
      clearTimeout(this.keyPressTimeout);
    }
    
    window.removeEventListener('resize', this.calculateScreenDimensions.bind(this));
  }

  /**
   * Calculate optimal screen dimensions to minimize scrolling
   */
  private calculateScreenDimensions(): void {
    this.screenHeight = window.innerHeight;
    
    // Calculate max height for content (optimized for minimal scrolling)
    const headerHeight = 180;
    const navigationHeight = 70;
    const padding = 20;
    
    const availableHeight = this.screenHeight - headerHeight - navigationHeight - padding;
    this.contentMaxHeight = `min(650px, ${Math.max(400, availableHeight)}px)`;
  }

  /**
   * Initialize Bootstrap modal references for keyboard control
   */
  private initializeModalReferences(): void {
    try {
      const questionMapElement = document.getElementById('questionMapModal');
      const calculatorElement = document.getElementById('calculatorOffcanvas');
      
      if (questionMapElement) {
        // @ts-ignore - Bootstrap modal instance
        this.questionMapModal = new bootstrap.Modal(questionMapElement);
      }
      if (calculatorElement) {
        // @ts-ignore - Bootstrap offcanvas instance  
        this.calculatorOffcanvas = new bootstrap.Offcanvas(calculatorElement);
      }
    } catch (error) {
      console.warn('Bootstrap not available for modal initialization');
    }
  }

  // =========================================================================
  // MODAL MANAGEMENT METHODS
  // =========================================================================

  /**
   * Show confirmation modal with custom options
   */
  private async showConfirmationModal(
    title: string, 
    message: string, 
    type: 'warning' | 'info' = 'warning'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalService.showModal({
        title,
        message,
        type,
        confirmText: 'Yes, Continue',
        cancelText: 'Cancel',
        showCancel: true
      }).subscribe(confirmed => {
        resolve(confirmed);
      });
    });
  }

  /**
   * Show success modal
   */
  private showSuccessModal(title: string, message: string): void {
    this.modalService.showModal({
      title,
      message,
      type: 'success',
      confirmText: 'OK'
    }).subscribe();
  }

  /**
   * Show error modal
   */
  private showErrorModal(title: string, message: string): void {
    this.modalService.showModal({
      title,
      message,
      type: 'error',
      confirmText: 'OK'
    }).subscribe();
  }

  /**
   * Show info modal
   */
  private showInfoModal(title: string, message: string): void {
    this.modalService.showModal({
      title,
      message,
      type: 'info',
      confirmText: 'OK'
    }).subscribe();
  }

  // =========================================================================
  // EXAM INITIALIZATION METHODS
  // =========================================================================

  /**
   * Check if user has read instructions before starting exam
   */
  checkInstructionsStatus(): void {
    this.examService.hasUserReadInstructions(this.currentTestId).subscribe({
      next: (response) => {
        if (response.hasRead) {
          this.startExam();
        } else {
          this.showInstructionsModal = true;
        }
      },
      error: () => {
        this.showInstructionsModal = true;
      }
    });
  }

  /**
   * Start exam session and initialize all components
   */
  startExam(): void {
    this.examService.startExam(this.currentTestId).subscribe({
      next: (session) => {
        this.sessionId = session.sessionId;
        this.totalDuration = session.durationMinutes * 60;

        // Initialize time and WebSocket connection
        this.examService.getTimeLeft(this.currentTestId).subscribe(time => {
          this.timeLeft = time || this.totalDuration;
          this.connectWebSocket();
        });

        // Load questions and start auto-save
        this.fetchQuestions();
        this.startAutoSave();
        this.getQuestionMaps();
      },
      error: (error) => {
        this.showErrorModal('Exam Start Failed', 'Unable to start the exam. Please try again or contact support.');
        console.error('Exam start error:', error);
      }
    });
  }

  /**
   * Handle instructions acknowledgment
   */
  onInstructionsAcknowledged(): void {
    this.showInstructionsModal = false;
    this.startExam();
  }

  /**
   * Handle modal closed event
   */
  onModalClosed(): void {
    this.showInstructionsModal = false;
  }

  // =========================================================================
  // WEBSOCKET AND REAL-TIME COMMUNICATION
  // =========================================================================

  /**
   * Connect to WebSocket for real-time timer updates
   */
  private connectWebSocket(): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      connectionTimeout: 5000
    });

    this.stompClient.onConnect = () => {
      // Subscribe to timer updates
      this.stompClient.subscribe(`/topic/timer/${this.sessionId}`, (msg: IMessage) => {
        this.timeLeft = Number(msg.body);
        
        // Auto-submit when time expires
        if (this.timeLeft <= 0) {
          this.autoSubmit();
        }
      });

      // Subscribe to exam completion events
      this.stompClient.subscribe(`/topic/exam-completed/${this.sessionId}`, () => {
        this.showInfoModal('Exam Completed', 'Your exam has been completed and submitted.');
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket error:', frame);
    };

    this.stompClient.activate();
  }

  // =========================================================================
  // QUESTION MANAGEMENT METHODS
  // =========================================================================

  /**
   * Fetch questions based on current filter and page
   */
  private fetchQuestions(): void {
    if (this.currentFilter) {
      this.fetchQuestionsByType();
    } else {
      this.fetchAllQuestions();
    }
  }

  /**
   * Fetch all questions without filtering
   */
  private fetchAllQuestions(): void {
    this.examService.getQuestions(this.currentTestId, this.page, this.size).subscribe({
      next: (res) => {
        this.handleQuestionsResponse(res);
      },
      error: (error) => {
        console.error('Error fetching questions:', error);
        this.showErrorModal('Load Error', 'Unable to load questions. Please refresh the page.');
      }
    });
  }

  /**
   * Fetch questions filtered by type
   */
  private fetchQuestionsByType(): void {
    if (!this.currentFilter) return;

    this.examService.getQuestionsByType(this.currentTestId, this.currentFilter, this.page, this.size)
      .subscribe({
        next: (res) => {
          this.handleQuestionsResponse(res);
        },
        error: (error) => {
          console.error('Error fetching filtered questions:', error);
          this.showErrorModal('Load Error', 'Unable to load filtered questions.');
        }
      });
  }

  /**
   * Handle questions API response and update component state
   */
  private handleQuestionsResponse(res: any): void {
    this.totalPages = res.totalPages;
    this.questions = res.content.map((q: any) => {
      const backendSavedAnswer = q.savedAnswer || '';
      const localAnswer = this.answers.find(a => a.studentExamQuestionId === q.studentExamQuestionId);

      // Sync answers from backend for MSQ questions
      if (backendSavedAnswer && !localAnswer && q.type === QuestionType.MULTIPLE_SELECT) {
        const newAnswer: AnswerDTO = {
          studentExamQuestionId: q.studentExamQuestionId,
          answer: backendSavedAnswer,
          questionId: q.questionId
        };
        this.answers.push(newAnswer);
      }

      return {
        ...q,
        type: q.type || QuestionType.MULTIPLE_CHOICE,
        choicesArray: q.choices ? q.choices.split(',') : [],
        savedAnswer: localAnswer ? localAnswer.answer : backendSavedAnswer
      };
    });
  }

  /**
   * Filter questions by type
   */
  filterByType(type: QuestionType): void {
    this.currentFilter = type;
    this.page = 0;
    this.fetchQuestions();
  }

  // =========================================================================
  // ANSWER MANAGEMENT METHODS
  // =========================================================================

  /**
   * Save answer for a question with proper type handling
   */
  saveAnswer(q: any, answer: string, isCheckbox: boolean = false): void {
    const existing = this.answers.find(a => a.studentExamQuestionId === q.studentExamQuestionId);

    if (isCheckbox && q.type === QuestionType.MULTIPLE_SELECT) {
      this.handleMultipleSelectAnswer(q, answer, existing);
    } else {
      this.handleSingleAnswer(q, answer, existing);
    }

    // Update question's savedAnswer for immediate UI reflection
    q.savedAnswer = this.getSavedAnswer(q);
    
    // Trigger change detection
    this.questions = [...this.questions];
  }

  /**
   * Handle multiple select (checkbox) answers
   */
  private handleMultipleSelectAnswer(q: any, answer: string, existing: AnswerDTO | undefined): void {
    let currentAnswers: string[] = [];
    if (existing) {
      currentAnswers = existing.answer ? existing.answer.split(',') : [];
    }

    const index = currentAnswers.indexOf(answer);
    if (index > -1) {
      currentAnswers.splice(index, 1);
    } else {
      currentAnswers.push(answer);
    }

    const newAnswer = currentAnswers.join(',');

    if (existing) {
      existing.answer = newAnswer;
    } else {
      this.answers.push({
        studentExamQuestionId: q.studentExamQuestionId,
        answer: newAnswer,
        questionId: q.id
      });
    }
  }

  /**
   * Handle single answer questions (MCQ, True/False, Fill Blank, Essay)
   */
  private handleSingleAnswer(q: any, answer: string, existing: AnswerDTO | undefined): void {
    if (existing) {
      existing.answer = answer;
    } else {
      this.answers.push({
        studentExamQuestionId: q.studentExamQuestionId,
        answer,
        questionId: q.id
      });
    }
  }

  /**
   * Handle checkbox change event for multiple select questions
   */
  onCheckboxChange(q: any, opt: string, event: any): void {
    const isChecked = event.target.checked;
    let existingAnswer = this.answers.find(a => a.studentExamQuestionId === q.studentExamQuestionId);

    if (!existingAnswer) {
      existingAnswer = {
        studentExamQuestionId: q.studentExamQuestionId,
        answer: '',
        questionId: q.id
      };
      this.answers.push(existingAnswer);
    }

    const currentAnswers = existingAnswer.answer ? existingAnswer.answer.split(',') : [];

    if (isChecked) {
      if (!currentAnswers.includes(opt)) {
        currentAnswers.push(opt);
      }
    } else {
      const index = currentAnswers.indexOf(opt);
      if (index > -1) {
        currentAnswers.splice(index, 1);
      }
    }

    existingAnswer.answer = currentAnswers.join(',');
    q.savedAnswer = existingAnswer.answer;
  }

  /**
   * Check if checkbox is checked for multiple select questions
   */
  isCheckboxChecked(q: any, opt: string): boolean {
    const answer = this.answers.find(a => a.studentExamQuestionId === q.studentExamQuestionId);
    if (!answer || !answer.answer) return false;
    return answer.answer.split(',').includes(opt);
  }

  /**
   * Get saved answer for a question
   */
  getSavedAnswer(q: any): string {
    const saved = this.answers.find(a => a.studentExamQuestionId === q.studentExamQuestionId);
    return saved ? saved.answer : (q.savedAnswer || '');
  }

  // =========================================================================
  // NAVIGATION METHODS
  // =========================================================================

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.fetchQuestions();
    }
  }

  /**
   * Navigate to previous page
   */
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.fetchQuestions();
    }
  }

  /**
   * Jump to specific question page
   */
  jumpToPageOf(q: any): void {
    this.currentFilter = q.type as QuestionType;
    this.page = q.number - 1;
    this.fetchQuestions();
  }

  // =========================================================================
  // EXAM SUBMISSION METHODS
  // =========================================================================

  /**
   * Submit exam with confirmation modal
   */
  async submitExam(): Promise<void> {
    const confirmed = await this.showConfirmationModal(
      'Submit Exam',
      'Are you sure you want to submit your exam?<br><small class="text-muted">You cannot return to it after submitting.</small>',
      'warning'
    );

    if (confirmed) {
      this.performExamSubmission();
    }
  }

  /**
   * Perform the actual exam submission
   */
  private performExamSubmission(): void {
    this.examService.saveAnswers(this.currentTestId, this.answers).subscribe({
      next: () => {
        this.examService.completeExam(this.currentTestId).subscribe({
          next: () => {
            this.showSuccessModal(
              'Exam Submitted',
              'Your exam has been submitted successfully. Redirecting to results...'
            );
            
            // Delay to allow backend processing
            setTimeout(() => {
              this.router.navigate(['/student/results-polling', this.sessionId]);
            }, 2000);
          },
          error: (error) => {
            console.error('Exam completion error:', error);
            this.showErrorModal(
              'Submission Error',
              'There was an error completing your exam. Please contact your instructor.'
            );
          }
        });
      },
      error: (error) => {
        console.error('Answer save error:', error);
        this.showErrorModal(
          'Save Error',
          'There was an error saving your answers. Please try again.'
        );
      }
    });
  }

  /**
   * Auto-submit when time expires
   */
  autoSubmit(): void {
    this.examService.saveAnswers(this.currentTestId, this.answers).subscribe({
      next: () => {
        this.examService.completeExam(this.currentTestId).subscribe({
          next: () => {
            this.showInfoModal(
              'Time Expired',
              'Your exam has been automatically submitted due to time expiration. Redirecting to results...'
            );
            
            setTimeout(() => {
              this.router.navigate(['/student/results-polling', this.sessionId]);
            }, 3000);
          },
          error: (error) => {
            console.error('Auto-submit error:', error);
          }
        });
      },
      error: (error) => {
        console.error('Auto-save error:', error);
      }
    });
  }

  // =========================================================================
  // AUTO-SAVE METHODS
  // =========================================================================

  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.examService.saveAnswers(this.currentTestId, this.answers).subscribe({
        next: () => {
          console.log('Answers auto-saved');
        },
        error: (error) => {
          console.error('Auto-save error:', error);
        }
      });
    }, 15000); // Save every 15 seconds
  }

  // =========================================================================
  // QUESTION MAP METHODS
  // =========================================================================

  /**
   * Get question map for navigation
   */
  getQuestionMaps(): void {
    this.examService.saveAnswers(this.currentTestId, this.answers).subscribe({
      next: () => {
        this.examService.getQuestionMap(this.currentTestId).subscribe({
          next: (data) => {
            this.groupedQuestionMap = data;
          },
          error: (error) => {
            console.error('Error fetching question map:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error saving answers before question map:', error);
      }
    });
  }

  /**
   * Check if a question is answered
   */
  isAnswered(studentExamQuestionId: number): boolean {
    return this.answers.some(
      a => a.studentExamQuestionId === studentExamQuestionId && a.answer !== ''
    );
  }

  // =========================================================================
  // UI HELPER METHODS
  // =========================================================================

  /**
   * Get progress bar class based on time remaining
   */
  getProgressBarClass(): string | string[] {
    if (this.totalDuration === 0) return 'bg-secondary';
    
    const percentage = (this.timeLeft / this.totalDuration) * 100;

    if (percentage > 50) {
      return 'bg-success';
    } else if (percentage > 20) {
      return 'bg-warning';
    } else if (percentage > 10) {
      return 'bg-danger';
    } else {
      return ['bg-danger', 'flash'];
    }
  }

  /**
   * Get question type badge class
   */
  getQuestionTypeClass(type: QuestionType): string {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE: return 'badge-mcq';
      case QuestionType.MULTIPLE_SELECT: return 'badge-msq';
      case QuestionType.TRUE_FALSE: return 'badge-tf';
      case QuestionType.FILL_IN_THE_BLANK: return 'badge-fib';
      case QuestionType.ESSAY: return 'badge-essay';
      default: return 'badge-secondary';
    }
  }

  /**
   * Format question type for display
   */
  formatQuestionType(type: QuestionType): string {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE: return 'Multiple Choice';
      case QuestionType.MULTIPLE_SELECT: return 'Multiple Select';
      case QuestionType.TRUE_FALSE: return 'True/False';
      case QuestionType.FILL_IN_THE_BLANK: return 'Fill in Blank';
      case QuestionType.ESSAY: return 'Essay';
      default: return type;
    }
  }

  /**
   * Get option letter (A, B, C, D, etc.)
   */
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /**
   * Check if question has media
   */
  hasMedia(q: any): boolean {
    return q.mediaType && q.mediaType !== MediaType.NONE && q.mediaPath;
  }

  /**
   * Get media URL
   */
  getMediaUrl(mediaPath: string | undefined): string {
    if (!mediaPath) {
      return '';
    }
    // Replace with your actual media URL logic
    return `https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop`;
  }

  /**
   * Handle essay content changes
   */
  onEssayContentChange(q: any, content: any): void {
    this.saveAnswer(q, content);
  }

  /**
   * Get Quill editor content
   */
  getQuillContent(q: any): any {
    const savedAnswer = this.getSavedAnswer(q);
    return savedAnswer;
  }

  // =========================================================================
  // QUESTION MAP STATISTICS METHODS
  // =========================================================================

  /**
   * Get ordered question types for display
   */
  getOrderedTypes(): string[] {
    const order = ['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_IN_THE_BLANK', 'ESSAY'];
    return order.filter(type => this.groupedQuestionMap[type]);
  }

  /**
   * Format type for display
   */
  formatType(type: string): string {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'Multiple Choice';
      case 'MULTIPLE_SELECT': return 'Multi Select';
      case 'TRUE_FALSE': return 'TRUE/FALSE';
      case 'FILL_IN_THE_BLANK': return 'Fill In Blank';
      case 'ESSAY': return 'Essay';
      default: return type;
    }
  }

  /**
   * Get total number of questions
   */
  getTotalQuestions(): number {
    let total = 0;
    for (const type of this.getOrderedTypes()) {
      total += this.groupedQuestionMap[type]?.length || 0;
    }
    return total;
  }

  /**
   * Get number of answered questions
   */
  getAnsweredCount(): number {
    let answered = 0;
    for (const type of this.getOrderedTypes()) {
      const questions = this.groupedQuestionMap[type] || [];
      answered += questions.filter(q => q.answered).length;
    }
    return answered;
  }
}