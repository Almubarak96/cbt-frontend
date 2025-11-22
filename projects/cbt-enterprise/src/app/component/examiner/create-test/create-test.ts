import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnlyNumericDirective } from '../../../pipes/only_numeric';
import { Router, ActivatedRoute } from '@angular/router';
import { ExaminerService } from '../../../service/exaimner.service';
import { TestModel } from '../../../models/test.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'create-test',
  imports: [ReactiveFormsModule, OnlyNumericDirective, CommonModule],
  templateUrl: './create-test.html',
  styleUrl: './create-test.scss'
})
export class CreateTest implements OnInit {
  testForm!: FormGroup;
  isEdit = false;
  error: string | null = null;
  id?: number;
  isLoading = false;
  currentStep = 1;
  totalSteps = 3;
  
  // Time enforcement options
  timeEnforcementOptions = [
    { value: 'STRICT', label: 'Strict - Auto-submit when time expires', description: 'Test automatically submits when time limit is reached' },
    { value: 'FLEXIBLE', label: 'Flexible - Allow overtime completion', description: 'Students can continue but answers are marked as overtime' },
    { value: 'NONE', label: 'None - No time enforcement', description: 'No automatic time enforcement' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private examinerService: ExaminerService
  ) { }

  ngOnInit() {
    this.initializeForm();
    
    this.route.paramMap.subscribe(params => {
      const testId = params.get('testId');
      if (testId) {
        this.isEdit = true;
        this.id = +testId;
        this.isLoading = true;
        this.examinerService.getTestById(this.id).subscribe({
          next: (test) => {
            this.testForm.patchValue(test);
            this.isLoading = false;
          },
          error: () => {
            this.error = 'Failed to load test.';
            this.isLoading = false;
          }
        });
      }
    });
  }

  private initializeForm() {
    this.testForm = this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      
      // Test Configuration
      numberOfQuestions: [null, [Validators.min(1)]],
      durationMinutes: [60, [Validators.required, Validators.min(1)]],
      totalMarks: [null, [Validators.required, Validators.min(1)]],
      passingScore: [null, [Validators.min(0)]],
      
      // Test Settings
      randomizeQuestions: [false],
      shuffleChoices: [false],
      published: [false],
      
      // Test Window Configuration
      scheduledStartTime: [null],
      scheduledEndTime: [null],
      timeEnforcement: ['STRICT'],
      maxAttempts: [null, [Validators.min(1)]],
      startBufferMinutes: [5, [Validators.min(0)]],
      endBufferMinutes: [5, [Validators.min(0)]],
      allowedIPs: [''],
      secureBrowser: [false]
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator for date range
  private dateRangeValidator(group: FormGroup) {
    const start = group.get('scheduledStartTime')?.value;
    const end = group.get('scheduledEndTime')?.value;
    
    if (start && end && new Date(start) >= new Date(end)) {
      return { dateRangeInvalid: true };
    }
    
    return null;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  saveTest() {
    if (this.testForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const test: TestModel = this.testForm.value;

    if (this.isEdit && this.id) {
      this.examinerService.updateTest(this.id, test).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['examiner/tests']);
        },
        error: (error) => {
          this.error = 'Failed to update test. ' + (error.error?.message || '');
          this.isLoading = false;
        }
      });
    } else {
      this.examinerService.createTest(test).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['examiner/tests']);
        },
        error: (error) => {
          this.error = 'Failed to create test. ' + (error.error?.message || '');
          this.isLoading = false;
        }
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.testForm.controls).forEach(key => {
      const control = this.testForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.testForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.testForm.get(fieldName);
    
    if (field?.errors?.['required']) {
      return 'This field is required';
    }
    if (field?.errors?.['minlength']) {
      return `Minimum length is ${field.errors?.['minlength'].requiredLength} characters`;
    }
    if (field?.errors?.['min']) {
      return `Minimum value is ${field.errors?.['min'].min}`;
    }
    if (field?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    
    return '';
  }

  // Helper to check if test window is enabled
  get isTestWindowEnabled(): boolean {
    return !!this.testForm.get('scheduledStartTime')?.value || 
           !!this.testForm.get('scheduledEndTime')?.value;
  }

  // Calculate test status based on current form values
  get calculatedStatus(): string {
    const published = this.testForm.get('published')?.value;
    const startTime = this.testForm.get('scheduledStartTime')?.value;
    const endTime = this.testForm.get('scheduledEndTime')?.value;
    
    if (!published) return 'Draft';
    
    const now = new Date();
    if (startTime && new Date(startTime) > now) return 'Scheduled';
    if (endTime && new Date(endTime) < now) return 'Expired';
    
    return 'Active';
  }
}