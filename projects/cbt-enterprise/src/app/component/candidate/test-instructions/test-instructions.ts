// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { ExamService } from '../../../service/exam.servise';
// import { ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-test-instructions',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './test-instructions.html',
//   styleUrl: './test-instructions.scss'
// })
// export class TestInstructions {


//   @Input() examId!: number;
//   @Input() studentId!: number;
//   @Input() showModal: boolean = false;
//   @Output() modalClosed = new EventEmitter<void>();
//   @Output() instructionsAcknowledged = new EventEmitter<void>();

//   instructions: any;
//   isLoading = false;
//   errorMessage = '';
//   hasReadInstructions = false;

//   constructor(private examService: ExamService) {}

//   ngOnChanges() {
//     if (this.showModal && this.examId && this.studentId) {
//       this.loadInstructions();
//       this.checkInstructionsStatus();
//     }
//   }

//   loadInstructions() {
//     this.isLoading = true;
//     this.examService.getInstructions(this.examId).subscribe({
//       next: (data) => {
//         this.instructions = data;
//         this.isLoading = false;
//       },
//       error: (error) => {
//         this.errorMessage = 'Failed to load instructions';
//         this.isLoading = false;
//         console.error('Error loading instructions', error);
//       }
//     });
//   }

//   checkInstructionsStatus() {
//     this.examService.hasUserReadInstructions(this.examId, this.studentId).subscribe({
//       next: (data) => {
//         this.hasReadInstructions = data.hasRead;
//       },
//       error: (error) => {
//         console.error('Error checking instructions status', error);
//       }
//     });
//   }

//   acknowledgeInstructions() {
//     this.isLoading = true;
//     this.examService.acknowledgeInstructions(this.examId, this.studentId).subscribe({
//       next: () => {
//         this.hasReadInstructions = true;
//         this.isLoading = false;
//         this.instructionsAcknowledged.emit();
//         this.closeModal();
//       },
//       error: (error) => {
//         this.errorMessage = 'Failed to acknowledge instructions';
//         this.isLoading = false;
//         console.error('Error acknowledging instructions', error);
//       }
//     });
//   }

//     onCheckboxChange(event: Event): void {
//     const target = event.target as HTMLInputElement;
//     this.hasReadInstructions = target.checked;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.modalClosed.emit();
//   }


// }



import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExamService } from '../../../service/exam.servise';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * TestInstructions Component
 * 
 * A reusable modal component that displays exam instructions and requires user acknowledgment
 * before proceeding with an exam. This component handles:
 * - Fetching exam instructions from the backend API
 * - Tracking user acknowledgment status
 * - Providing a modal interface for instruction display
 * - Emitting events for parent component communication
 * 
 * @selector app-test-instructions
 * @standalone true
 * @imports ReactiveFormsModule, CommonModule
 * 
 * @example
 * <app-test-instructions
 *   [examId]="currentExamId"
 *   [studentId]="currentStudentId"
 *   [showModal]="showInstructions"
 *   (modalClosed)="handleModalClose()"
 *   (instructionsAcknowledged)="handleAcknowledgment()">
 * </app-test-instructions>
 */
@Component({
  selector: 'app-test-instructions',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './test-instructions.html',
  styleUrl: './test-instructions.scss'
})
export class TestInstructions {

  // INPUT PROPERTIES

  /**
   * examId - The unique identifier of the exam for which to display instructions
   * @type {number}
   * @required Must be provided by parent component
   * @example 12345
   */
  @Input() examId!: number;

  /**
   * studentId - The unique identifier of the student viewing the instructions
   * @type {number}
   * @required Must be provided by parent component
   * @example 67890
   */
  //@Input() studentId!: number;

  /**
   * showModal - Controls the visibility state of the instructions modal
   * @type {boolean}
   * @default false
   * @example true // shows the modal
   */
  @Input() showModal: boolean = false;

  // OUTPUT EVENTS

  /**
   * modalClosed - Event emitted when the modal is closed by user action
   * @event
   * @type {EventEmitter<void>}
   * @example (modalClosed)="onModalClosed()"
   */
  @Output() modalClosed = new EventEmitter<void>();

  /**
   * instructionsAcknowledged - Event emitted when user successfully acknowledges instructions
   * @event
   * @type {EventEmitter<void>}
   * @example (instructionsAcknowledged)="onInstructionsAcknowledged()"
   */
  @Output() instructionsAcknowledged = new EventEmitter<void>();

  // COMPONENT STATE PROPERTIES

  /**
   * instructions - Stores the exam instructions data retrieved from the API
   * @type {any}
   * @structure Expected to contain: examName, instructions[], durationMinutes, etc.
   */
  instructions: any;

  /**
   * isLoading - Indicates whether an API request is currently in progress
   * @type {boolean}
   * @default false
   * @usedFor Showing loading spinners and disabling UI during API calls
   */
  isLoading = false;

  /**
   * errorMessage - Stores error messages for display when API operations fail
   * @type {string}
   * @default ''
   */
  errorMessage = '';

  /**
   * hasReadInstructions - Tracks whether the user has checked the acknowledgment checkbox
   * @type {boolean}
   * @default false
   * @usedFor Enabling/disabling the confirmation button
   */
  hasReadInstructions = false;

  /**
   * Constructor - Dependency injection for required services
   * @param examService - Service handling exam-related API communications
   */
  constructor(private examService: ExamService) {}

  // LIFECYCLE HOOKS

  /**
   * ngOnChanges - Angular lifecycle hook called when input properties change
   * Automatically loads instructions when modal becomes visible with valid IDs
   * @listens Input property changes
   */
  ngOnChanges() {
    if (this.showModal && this.examId) {
      this.loadInstructions();
      this.checkInstructionsStatus();
    }
  }

  // PUBLIC METHODS

  /**
   * loadInstructions - Fetches exam instructions from the backend API
   * @method
   * @async
   * @throws Sets errorMessage on API failure
   * @emits isLoading state changes
   */
  loadInstructions() {
    this.isLoading = true;
    this.examService.getInstructions(this.examId).subscribe({
      next: (data) => {
        this.instructions = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load instructions';
        this.isLoading = false;
        console.error('Error loading instructions', error);
      }
    });
  }

  /**
   * checkInstructionsStatus - Verifies if user has previously acknowledged instructions
   * @method
   * @async
   * @usedFor Pre-populating acknowledgment state when reopening modal
   */
  checkInstructionsStatus() {
    this.examService.hasUserReadInstructions(this.examId).subscribe({
      next: (data) => {
        this.hasReadInstructions = data.hasRead;
      },
      error: (error) => {
        console.error('Error checking instructions status', error);
      }
    });
  }

  /**
   * acknowledgeInstructions - Submits user acknowledgment to the backend
   * @method
   * @async
   * @requires hasReadInstructions to be true
   * @emits instructionsAcknowledged on success
   * @emits isLoading state changes
   * @throws Sets errorMessage on API failure
   */
  acknowledgeInstructions() {
    this.isLoading = true;
    this.examService.acknowledgeInstructions(this.examId).subscribe({
      next: () => {
        this.hasReadInstructions = true;
        this.isLoading = false;
        this.instructionsAcknowledged.emit();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = 'Failed to acknowledge instructions';
        this.isLoading = false;
        console.error('Error acknowledging instructions', error);
      }
    });
  }

  /**
   * onCheckboxChange - Handles the checkbox change event for instruction acknowledgment
   * @method
   * @param {Event} event - The DOM event from the checkbox input
   * @listens checkbox change events
   */
  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.hasReadInstructions = target.checked;
  }

  /**
   * closeModal - Closes the modal and notifies parent component
   * @method
   * @emits modalClosed event
   */
  closeModal() {
    this.showModal = false;
    this.modalClosed.emit();
  }
}
