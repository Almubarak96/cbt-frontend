import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../../service/exam.servise';
import { ExaminerService } from '../../../service/exaimner.service';
import { TestInstructionsService } from '../../../service/test-instructions.service';

@Component({
  selector: 'app-test-instructions-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './test-instructions-form.html',
  styleUrls: ['./test-instructions-form.scss']
})
export class TestInstructionsFormComponent implements OnInit {
  instructionsForm: FormGroup;
  testId!: number;
  test: any;
  isLoading = false;
  isEditing = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examService: TestInstructionsService,
    private examinerService: ExaminerService
  ) {
    this.instructionsForm = this.createForm();
  }

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTestDetails();
    this.loadInstructions();
  }

  createForm(): FormGroup {
    return this.fb.group({
      testId: [null, Validators.required],
      examName: ['', Validators.required],
      instructions: this.fb.array([], Validators.required),
      durationMinutes: [0, [Validators.required, Validators.min(1)]],
      totalQuestions: [0, [Validators.required, Validators.min(1)]],
      passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      shuffleQuestions: [false],
      shuffleChoices: [false],
      showResultsImmediately: [false]
    });
  }

  get instructionsArray(): FormArray {
    return this.instructionsForm.get('instructions') as FormArray;
  }

  addInstruction(instruction: string = ''): void {
    this.instructionsArray.push(this.fb.control(instruction, Validators.required));
  }

  removeInstruction(index: number): void {
    this.instructionsArray.removeAt(index);
  }

  loadTestDetails(): void {
    this.examinerService.getTestById(this.testId).subscribe({
      next: (test) => {
        this.test = test;
        this.instructionsForm.patchValue({
          testId: test.id,
          examName: test.title || `Test ${test.id}`,
          durationMinutes: test.durationMinutes || 60,
          totalQuestions: test.numberOfQuestions || 0,
          shuffleQuestions: test.randomizeQuestions || false,
          shuffleChoices: test.shuffleChoices || false
        });
      },
      error: (error) => {
        console.error('Error loading test details:', error);
      }
    });
  }

  loadInstructions(): void {
    this.isLoading = true;
    this.examService.getInstructions(this.testId.toString()).subscribe({
      next: (instructions) => {
        if (instructions) {
          this.isEditing = true;
          // Clear existing instructions
          while (this.instructionsArray.length !== 0) {
            this.instructionsArray.removeAt(0);
          }
          // Add loaded instructions
          instructions.instructions.forEach((instruction: string) => {
            this.addInstruction(instruction);
          });
          
          this.instructionsForm.patchValue({
            examName: instructions.examName,
            durationMinutes: instructions.durationMinutes,
            totalQuestions: instructions.totalQuestions,
            passingScore: instructions.passingScore,
            shuffleQuestions: instructions.shuffleQuestions,
            shuffleChoices: instructions.shuffleChoices,
            showResultsImmediately: instructions.showResultsImmediately
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        // If no instructions found, create default ones
        if (error.status === 404) {
          this.createDefaultInstructions();
        } else {
          this.errorMessage = 'Failed to load instructions';
          console.error('Error loading instructions:', error);
        }
        this.isLoading = false;
      }
    });
  }

  createDefaultInstructions(): void {
    // Add some default instructions
    const defaultInstructions = [
      'This exam consists of multiple-choice questions. You must answer all questions.',
      'You have limited time to complete the exam.',
      'Do not refresh the page during the exam.',
      'Ensure you have a stable internet connection.',
      'Any attempt to cheat will result in immediate disqualification.'
    ];

    defaultInstructions.forEach(instruction => {
      this.addInstruction(instruction);
    });
  }

  onSubmit(): void {
    if (this.instructionsForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.instructionsForm.value;

      const instructionsData = {
        testId: this.testId,
        examName: formData.examName,
        instructions: formData.instructions,
        durationMinutes: formData.durationMinutes,
        totalQuestions: formData.totalQuestions,
        passingScore: formData.passingScore,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleChoices: formData.shuffleChoices,
        showResultsImmediately: formData.showResultsImmediately
      };

      const saveOperation = this.isEditing 
        ? this.examService.updateInstructions(this.testId, instructionsData)
        : this.examService.saveInstructions(instructionsData);

      saveOperation.subscribe({
        next: () => {
          this.successMessage = `Instructions ${this.isEditing ? 'updated' : 'saved'} successfully!`;
          this.isLoading = false;
          this.isEditing = true;
        },
        error: (error) => {
          this.errorMessage = `Failed to ${this.isEditing ? 'update' : 'save'} instructions`;
          console.error('Error saving instructions:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.instructionsForm.controls).forEach(key => {
      const control = this.instructionsForm.get(key);
      control?.markAsTouched();
    });
  }

  onReset(): void {
    this.instructionsForm.reset({
      testId: this.testId,
      examName: this.test?.title || `Test ${this.testId}`,
      durationMinutes: this.test?.durationMinutes || 60,
      totalQuestions: this.test?.numberOfQuestions || 0,
      passingScore: 70,
      shuffleQuestions: this.test?.randomizeQuestions || false,
      shuffleChoices: this.test?.shuffleChoices || false,
      showResultsImmediately: false
    });
    
    // Clear instructions array
    while (this.instructionsArray.length !== 0) {
      this.instructionsArray.removeAt(0);
    }
    
    this.createDefaultInstructions();
  }

  onBack(): void {
    this.router.navigate(['/examiner/tests']);
  }

  addNewInstruction(): void {
    this.addInstruction();
  }

  previewInstructions(): void {
    // You can implement a preview modal here
    console.log('Preview instructions:', this.instructionsForm.value);
  }
}
