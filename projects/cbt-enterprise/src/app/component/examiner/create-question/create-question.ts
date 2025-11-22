// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { ExaminerService } from '../../../service/exaimner.service';
// import { QuestionModel } from '../../../models/question.model';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-create-question',
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './create-question.html',
//   styleUrls: ['./create-question.scss']
// })
// export class CreateQuestion {
//   questionForm!: FormGroup;
//   isEdit = false;
//   error: string | null = null;
//   testId!: number;
//   questionId?: number;
//   isLoading = false;
//   private isAdjustingType = false; // Add this flag

//   questionTypes = [
//     'MULTIPLE_CHOICE',
//     'MULTIPLE_SELECT',
//     'TRUE_FALSE',
//     'FILL_IN_THE_BLANK',
//     'ESSAY',
//     'MATCHING'
//   ];

//   mediaTypes = ['NONE', 'IMAGE', 'VIDEO', 'AUDIO'];
//   mcqOptions: string[] = [];

//   constructor(
//     private fb: FormBuilder,
//     public router: Router,
//     private route: ActivatedRoute,
//     private examinerService: ExaminerService
//   ) { }

//   get matchingPairs(): FormArray {
//     return this.questionForm.get('matchingPairs') as FormArray;
//   }

//   get optionsArray(): FormArray {
//     return this.questionForm.get('optionsArray') as FormArray;
//   }

//   get selectedCorrectAnswers(): FormArray {
//     return this.questionForm.get('selectedCorrectAnswers') as FormArray;
//   }

//   ngOnInit() {
//     this.route.paramMap.subscribe(params => {
//       this.testId = Number(params.get('testId'));
//       const qid = params.get('questionId');

//       this.initializeForm();

//       if (qid) {
//         this.isEdit = true;
//         this.questionId = +qid;
//         this.isLoading = true;
//         this.examinerService.getQuestion(this.testId, this.questionId).subscribe({
//           next: (question) => {
//             this.loadQuestionData(question);
//             this.isLoading = false;
//           },
//           error: () => {
//             this.error = 'Failed to load question.';
//             this.isLoading = false;
//           }
//         });
//       }
//     });
//   }

//   private initializeForm() {
//     this.questionForm = this.fb.group({
//       text: ['', [Validators.required, Validators.minLength(5)]],
//       type: ['MULTIPLE_CHOICE', Validators.required],
//       maxMarks: [1, [Validators.required, Validators.min(0.1)]],
//       choices: [''],
//       correctAnswer: [''],
//       mediaType: ['NONE'],
//       mediaPath: [''],
//       mediaCaption: [''],
//       matchingPairs: this.fb.array([]),
//       optionsArray: this.fb.array([]),
//       selectedCorrectAnswers: this.fb.array([])
//     });

//     this.questionForm.get('type')?.valueChanges.subscribe(type => {
//       if (type && !this.isAdjustingType) { // Add check for flag
//         this.adjustFormForType(type);
//       }
//     });

//     this.questionForm.get('mediaType')?.valueChanges.subscribe(mediaType => {
//       this.toggleMediaFields(mediaType);
//     });
//   }

//   private loadQuestionData(question: any) {
//     this.questionForm.patchValue(question);

//     if ((question.type === 'MULTIPLE_CHOICE' || question.type === 'MULTIPLE_SELECT') && question.choices) {
//       const choicesArray = question.choices.split(',').map((choice: string) => choice.trim());
//       this.setOptions(choicesArray);
//     }

//     if (question.type === 'MULTIPLE_SELECT' && question.correctAnswer) {
//       const correctAnswers = question.correctAnswer.split(',').map((answer: string) => answer.trim());
//       this.setSelectedCorrectAnswers(correctAnswers);
//     }

//     if (question.type === 'MATCHING' && question.matchingPairs) {
//       question.matchingPairs.forEach((pair: any) =>
//         this.matchingPairs.push(this.createPair(pair.leftText, pair.rightText))
//       );
//     }

//     if (question.type) this.adjustFormForType(question.type);
//   }

//   private adjustFormForType(type: string) {
//     this.isAdjustingType = true; // Set flag to prevent recursion

//     try {
//       // Clear dynamic arrays
//       while (this.matchingPairs.length) this.matchingPairs.removeAt(0);
//       while (this.optionsArray.length) this.optionsArray.removeAt(0);
//       while (this.selectedCorrectAnswers.length) this.selectedCorrectAnswers.removeAt(0);
//       this.mcqOptions = [];

//       // Reset validators for specific controls only
//       this.resetTypeSpecificValidators();

//       switch (type) {
//         case 'MATCHING':
//           this.addPair();
//           this.matchingPairs.setValidators(Validators.required);
//           break;
//         case 'MULTIPLE_CHOICE':
//           this.addOption(); 
//           this.addOption();
//           this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
//           break;
//         case 'MULTIPLE_SELECT':
//           this.addOption();
//           this.addOption();
//           break;
//         case 'TRUE_FALSE':
//           this.questionForm.patchValue({ correctAnswer: true });
//           this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
//           break;
//         case 'FILL_IN_THE_BLANK':
//           this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
//           break;
//         case 'ESSAY':
//           this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
//           break;
//       }

//       this.questionForm.updateValueAndValidity();
//     } finally {
//       this.isAdjustingType = false; // Reset flag
//     }
//   }

//   private resetTypeSpecificValidators() {
//     // Only reset validators for controls that change per question type
//     this.questionForm.get('choices')?.clearValidators();
//     this.questionForm.get('correctAnswer')?.clearValidators();
//     this.matchingPairs.clearValidators();
//     this.optionsArray.clearValidators();

//     // Don't call updateValueAndValidity() here to avoid recursion
//   }

//   private toggleMediaFields(mediaType: string) {
//     const mediaPathControl = this.questionForm.get('mediaPath');
//     const mediaCaptionControl = this.questionForm.get('mediaCaption');

//     if (mediaType === 'NONE') {
//       mediaPathControl?.clearValidators();
//       mediaCaptionControl?.clearValidators();
//       this.questionForm.patchValue({
//         mediaPath: '',
//         mediaCaption: ''
//       });
//     } else {
//       mediaPathControl?.setValidators([Validators.required]);
//       mediaCaptionControl?.setValidators([Validators.required]);
//     }

//     mediaPathControl?.updateValueAndValidity();
//     mediaCaptionControl?.updateValueAndValidity();
//   }

//   // Option management methods
//   createOption(value: string = '') {
//     return this.fb.control(value, [Validators.required, Validators.minLength(1)]);
//   }

//   addOption() {
//     this.optionsArray.push(this.createOption());
//     this.updateOptionsAndChoices();
//   }

//   removeOption(index: number) {
//     if (this.optionsArray.length > 1) {
//       this.optionsArray.removeAt(index);
//       this.updateOptionsAndChoices();
//     }
//   }

//   onOptionChange() {
//     this.updateOptionsAndChoices();
//   }

//   private updateOptionsAndChoices() {
//     this.mcqOptions = this.optionsArray.controls
//       .map(control => control.value)
//       .filter(value => value && value.trim().length > 0);

//     this.questionForm.patchValue({
//       choices: this.mcqOptions.join(', ')
//     });

//     this.questionForm.updateValueAndValidity();
//   }

//   private setOptions(choices: string[]) {
//     this.optionsArray.clear();
//     choices.forEach(choice => {
//       if (choice.trim()) {
//         this.optionsArray.push(this.createOption(choice.trim()));
//       }
//     });
//     this.updateOptionsAndChoices();
//   }

//   private setSelectedCorrectAnswers(answers: string[]) {
//     while (this.selectedCorrectAnswers.length) {
//       this.selectedCorrectAnswers.removeAt(0);
//     }
//     answers.forEach(answer => {
//       if (answer.trim()) {
//         this.selectedCorrectAnswers.push(this.fb.control(answer.trim()));
//       }
//     });
//   }

//   onCorrectAnswerSelect(answer: string) {
//     this.questionForm.patchValue({ correctAnswer: answer });
//   }

//   onMultipleAnswerToggle(answer: string) {
//     const answerIndex = this.selectedCorrectAnswers.value.indexOf(answer);
//     if (answerIndex > -1) {
//       this.selectedCorrectAnswers.removeAt(answerIndex);
//     } else {
//       this.selectedCorrectAnswers.push(this.fb.control(answer));
//     }
//   }

//   isAnswerSelected(answer: string): boolean {
//     if (this.questionForm.value.type === 'MULTIPLE_SELECT') {
//       return this.selectedCorrectAnswers.value.includes(answer);
//     }
//     return this.questionForm.get('correctAnswer')?.value === answer;
//   }

//   // Matching pairs methods
//   createPair(left = '', right = '') {
//     return this.fb.group({
//       leftText: [left, Validators.required],
//       rightText: [right, Validators.required]
//     });
//   }

//   addPair() {
//     this.matchingPairs.push(this.createPair());
//   }

//   removePair(index: number) {
//     this.matchingPairs.removeAt(index);
//   }

//   onSubmit(): void {
//     if (this.questionForm.invalid) {
//       this.markFormGroupTouched();
//       return;
//     }

//     this.isLoading = true;
//     const formValue = this.questionForm.value;

//     const formData = {
//       ...formValue,
//       testId: this.testId,
//       correctAnswer: formValue.type === 'MULTIPLE_SELECT' 
//         ? this.selectedCorrectAnswers.value.join(', ') 
//         : formValue.correctAnswer
//     };

//     const { selectedCorrectAnswers, optionsArray, ...question } = formData;

//     if (this.isEdit && this.questionId) {
//       this.examinerService.updateQuestion(this.testId, this.questionId, question as QuestionModel).subscribe({
//         next: () => {
//           this.isLoading = false;
//           this.router.navigate(['examiner/tests', this.testId, 'questions']);
//         },
//         error: () => {
//           this.error = 'Failed to update question.';
//           this.isLoading = false;
//         }
//       });
//     } else {
//       this.examinerService.addQuestion(this.testId, question as QuestionModel).subscribe({
//         next: () => {
//           this.isLoading = false;
//           this.router.navigate(['examiner/tests', this.testId, 'questions']);
//         },
//         error: () => {
//           this.error = 'Failed to create question.';
//           this.isLoading = false;
//         }
//       });
//     }
//   }

//   private markFormGroupTouched() {
//     Object.keys(this.questionForm.controls).forEach(key => {
//       const control = this.questionForm.get(key);
//       control?.markAsTouched();
//     });
//   }

//   isFieldInvalid(fieldName: string): boolean {
//     const field = this.questionForm.get(fieldName);
//     return !!(field && field.invalid && (field.dirty || field.touched));
//   }

//   getFieldError(fieldName: string): string {
//     const field = this.questionForm.get(fieldName);
//     if (field?.errors?.['required']) return 'This field is required';
//     if (field?.errors?.['minlength']) return `Minimum length is ${field.errors?.['minlength'].requiredLength} characters`;
//     if (field?.errors?.['min']) return `Minimum value is ${field.errors?.['min'].min}`;
//     return '';
//   }

//   formatQuestionType(type: string): string {
//     return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//   }

//   getOptionLetter(index: number): string {
//     return String.fromCharCode(65 + index);
//   }
// }






























import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ExaminerService } from '../../../service/exaimner.service';
import { QuestionModel } from '../../../models/question.model';
import { CommonModule } from '@angular/common';

/**
 * Enhanced CreateQuestion Component with Stepper Form and Media Support
 * 
 * This component provides a comprehensive question creation interface with:
 * - Multi-step form wizard for better user experience
 * - Dynamic form adaptation based on question type
 * - Media upload support for multiple storage backends
 * - Real-time validation and preview
 * - Support for all question types with specialized inputs
 * 
 * @author Almubarak Suleiman
 * @version 2.0
 * @since 2025
 */
@Component({
  selector: 'app-create-question',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-question.html',
  styleUrls: ['./create-question.scss']
})
export class CreateQuestion implements OnInit {
  questionForm!: FormGroup;
  isEdit = false;
  error: string | null = null;
  testId!: number;
  questionId?: number;
  isLoading = false;
  currentStep = 1;
  totalSteps = 4;
  private isAdjustingType = false;

  // Question configuration options
  questionTypes = [
    'MULTIPLE_CHOICE',
    'MULTIPLE_SELECT',
    'TRUE_FALSE',
    'FILL_IN_THE_BLANK',
    'ESSAY',
    'MATCHING'
  ];

  mediaTypes = ['NONE', 'IMAGE', 'VIDEO', 'AUDIO'];
  difficultyLevels = ['EASY', 'MEDIUM', 'HARD'];

  mcqOptions: string[] = [];
  mediaFile: File | null = null;
  mediaPreview: string | null = null;

  // Step descriptions for better UX
  stepTitles = [
    'Basic Information',
    'Question Content',
    'Media & Advanced',
    'Review & Save'
  ];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private examinerService: ExaminerService,
    private http: HttpClient
  ) { }

  // Form array getters
  get matchingPairs(): FormArray {
    return this.questionForm.get('matchingPairs') as FormArray;
  }

  get optionsArray(): FormArray {
    return this.questionForm.get('optionsArray') as FormArray;
  }

  get selectedCorrectAnswers(): FormArray {
    return this.questionForm.get('selectedCorrectAnswers') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.testId = Number(params.get('testId'));
      const qid = params.get('questionId');

      this.initializeForm();

      if (qid) {
        this.isEdit = true;
        this.questionId = +qid;
        this.loadQuestionData();
      }
    });
  }

  /**
   * Initializes the reactive form with comprehensive validation
   */
  private initializeForm() {
    this.questionForm = this.fb.group({
      // Step 1: Basic Information
      type: ['MULTIPLE_CHOICE', [Validators.required]],
      category: [''],
      difficulty: ['MEDIUM'],
      questionOrder: [null, [Validators.min(1)]],

      // Step 2: Question Content
      text: ['', [Validators.required, Validators.minLength(5)]],
      maxMarks: [1, [Validators.required, Validators.min(0.1)]],
      choices: [''],
      correctAnswer: [''],
      explanation: [''],

      // Step 3: Media & Advanced
      mediaType: ['NONE'],
      mediaPath: [''],
      mediaCaption: [''],
      timeLimitSeconds: [null, [Validators.min(1)]],
      allowPartialCredit: [false],

      // Dynamic arrays
      matchingPairs: this.fb.array([]),
      optionsArray: this.fb.array([]),
      selectedCorrectAnswers: this.fb.array([])
    }, {
      validators: [this.questionTypeValidator, this.mediaValidator]
    });

    // Type change handler
    this.questionForm.get('type')?.valueChanges.subscribe(type => {
      if (type && !this.isAdjustingType) {
        this.adjustFormForType(type);
      }
    });

    // Media type change handler
    this.questionForm.get('mediaType')?.valueChanges.subscribe(mediaType => {
      this.toggleMediaFields(mediaType);
    });

    // Initialize with default type
    this.adjustFormForType('MULTIPLE_CHOICE');
  }

  // /**
  //  * Custom validator for question type specific rules
  //  */
  // private questionTypeValidator(group: FormGroup) {
  //   const type = group.get('type')?.value;
  //   const correctAnswer = group.get('correctAnswer')?.value;
  //   const optionsArray = group.get('optionsArray') as FormArray;

  //   switch (type) {
  //     case 'MULTIPLE_CHOICE':
  //       if (!correctAnswer) {
  //         return { requiredCorrectAnswer: true };
  //       }
  //       if (optionsArray.length < 2) {
  //         return { minOptionsRequired: true };
  //       }
  //       break;
  //     case 'MULTIPLE_SELECT':
  //       const selectedAnswers = group.get('selectedCorrectAnswers') as FormArray;
  //       if (selectedAnswers.length === 0) {
  //         return { atLeastOneCorrectAnswer: true };
  //       }
  //       break;
  //     case 'MATCHING':
  //       const matchingPairs = group.get('matchingPairs') as FormArray;
  //       if (matchingPairs.length === 0) {
  //         return { atLeastOneMatchingPair: true };
  //       }
  //       break;
  //   }

  //   return null;
  // }


  /**
 * Custom validator for question type specific rules
 */
  private questionTypeValidator(group: FormGroup) {
    const type = group.get('type')?.value;
    const correctAnswer = group.get('correctAnswer')?.value;
    const optionsArray = group.get('optionsArray') as FormArray;

    switch (type) {
      case 'MULTIPLE_CHOICE':
        if (!correctAnswer || correctAnswer.trim() === '') {
          return { requiredCorrectAnswer: true };
        }
        if (optionsArray.length < 2) {
          return { minOptionsRequired: true };
        }
        // Check if at least 2 options have values
        const validOptions = optionsArray.controls.filter(control =>
          control.value && control.value.trim().length > 0
        );
        if (validOptions.length < 2) {
          return { minValidOptionsRequired: true };
        }
        break;

      case 'MULTIPLE_SELECT':
        const selectedAnswers = group.get('selectedCorrectAnswers') as FormArray;
        if (selectedAnswers.length === 0) {
          return { atLeastOneCorrectAnswer: true };
        }
        if (optionsArray.length < 2) {
          return { minOptionsRequired: true };
        }
        // Check if at least 2 options have values
        const validOptionsMS = optionsArray.controls.filter(control =>
          control.value && control.value.trim().length > 0
        );
        if (validOptionsMS.length < 2) {
          return { minValidOptionsRequired: true };
        }
        break;

      case 'MATCHING':
        const matchingPairs = group.get('matchingPairs') as FormArray;
        if (matchingPairs.length === 0) {
          return { atLeastOneMatchingPair: true };
        }
        // Check if all pairs have both left and right text
        const validPairs = matchingPairs.controls.filter(pair =>
          pair.get('leftText')?.value?.trim() && pair.get('rightText')?.value?.trim()
        );
        if (validPairs.length === 0) {
          return { validMatchingPairsRequired: true };
        }
        break;

      case 'TRUE_FALSE':
        if (!correctAnswer || correctAnswer.trim() === '') {
          return { requiredCorrectAnswer: true };
        }
        break;

      case 'FILL_IN_THE_BLANK':
      case 'ESSAY':
        if (!correctAnswer || correctAnswer.trim() === '') {
          return { requiredCorrectAnswer: true };
        }
        break;
    }

    return null;
  }



  /**
   * Custom validator for media fields
   */
  private mediaValidator(group: FormGroup) {
    const mediaType = group.get('mediaType')?.value;
    const mediaPath = group.get('mediaPath')?.value;
    const mediaCaption = group.get('mediaCaption')?.value;

    if (mediaType !== 'NONE') {
      if (!mediaPath || mediaPath.trim() === '') {
        return { mediaPathRequired: true };
      }
      if (!mediaCaption || mediaCaption.trim() === '') {
        return { mediaCaptionRequired: true };
      }
    }

    return null;
  }

  /**
   * Loads question data for editing
   */
  private loadQuestionData() {
    this.isLoading = true;
    this.examinerService.getQuestion(this.testId, this.questionId!).subscribe({
      next: (question) => {
        this.questionForm.patchValue(question);

        // Load dynamic content based on question type
        this.loadDynamicContent(question);

        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load question. ' + (error.error?.message || '');
        this.isLoading = false;
      }
    });
  }

  /**
   * Loads dynamic form content based on question type
   */
  private loadDynamicContent(question: any) {
    if ((question.type === 'MULTIPLE_CHOICE' || question.type === 'MULTIPLE_SELECT') && question.choices) {
      const choicesArray = question.choices.split(',').map((choice: string) => choice.trim());
      this.setOptions(choicesArray);
    }

    if (question.type === 'MULTIPLE_SELECT' && question.correctAnswer) {
      const correctAnswers = question.correctAnswer.split(',').map((answer: string) => answer.trim());
      this.setSelectedCorrectAnswers(correctAnswers);
    }

    if (question.type === 'MATCHING' && question.matchingPairs) {
      question.matchingPairs.forEach((pair: any) =>
        this.matchingPairs.push(this.createPair(pair.leftText, pair.rightText))
      );
    }

    // Load media preview if exists
    if (question.mediaType !== 'NONE' && question.mediaPath) {
      if (question.mediaPath.startsWith('http') || question.mediaPath.startsWith('data:')) {
        this.mediaPreview = question.mediaPath;
      }
    }

    if (question.type) {
      this.adjustFormForType(question.type);
    }
  }

  /**
   * Adjusts form controls based on selected question type
   */
  private adjustFormForType(type: string) {
    this.isAdjustingType = true;

    try {
      // Clear dynamic arrays
      while (this.matchingPairs.length) this.matchingPairs.removeAt(0);
      while (this.optionsArray.length) this.optionsArray.removeAt(0);
      while (this.selectedCorrectAnswers.length) this.selectedCorrectAnswers.removeAt(0);
      this.mcqOptions = [];

      // Reset validators
      this.questionForm.get('correctAnswer')?.clearValidators();
      this.matchingPairs.clearValidators();
      this.optionsArray.clearValidators();

      switch (type) {
        case 'MATCHING':
          this.addPair();
          this.matchingPairs.setValidators(Validators.required);
          break;
        case 'MULTIPLE_CHOICE':
          this.addOption();
          this.addOption();
          this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
          break;
        case 'MULTIPLE_SELECT':
          this.addOption();
          this.addOption();
          break;
        case 'TRUE_FALSE':
          this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
          break;
        case 'FILL_IN_THE_BLANK':
        case 'ESSAY':
          this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
          break;
      }

      this.questionForm.updateValueAndValidity();
    } finally {
      this.isAdjustingType = false;
    }
  }

  /**
   * Toggles media field validators based on media type selection
   */
  private toggleMediaFields(mediaType: string) {
    const mediaPathControl = this.questionForm.get('mediaPath');
    const mediaCaptionControl = this.questionForm.get('mediaCaption');

    if (mediaType === 'NONE') {
      mediaPathControl?.clearValidators();
      mediaCaptionControl?.clearValidators();
      this.questionForm.patchValue({
        mediaPath: '',
        mediaCaption: ''
      });
      this.mediaFile = null;
      this.mediaPreview = null;
    } else {
      mediaPathControl?.setValidators([Validators.required]);
      mediaCaptionControl?.setValidators([Validators.required]);
    }

    mediaPathControl?.updateValueAndValidity();
    mediaCaptionControl?.updateValueAndValidity();
  }

  // Stepper Navigation Methods

  // /**
  //  * Navigates to the next step if current step is valid
  //  */
  // nextStep() {
  //   if (this.currentStep < this.totalSteps && this.isStepValid(this.currentStep)) {
  //     this.currentStep++;
  //   } else {
  //     this.markCurrentStepTouched();
  //   }
  // }

  /**
 * Navigates to the next step if current step is valid
 */
  nextStep() {
    // Debug current step validation


    if (this.currentStep < this.totalSteps && this.isStepValid(this.currentStep)) {
      this.currentStep++;
    } else {
      this.markCurrentStepTouched();

      // Show specific error for MULTIPLE_SELECT
      if (this.currentStep === 2 && this.questionForm.get('type')?.value === 'MULTIPLE_SELECT') {
        if (this.selectedCorrectAnswers.length === 0) {
          this.error = 'Please select at least one correct answer for multiple select question.';
        } else if (this.mcqOptions.length < 2) {
          this.error = 'Please provide at least two valid options for multiple select question.';
        }
      }
    }
  }

  /**
   * Navigates to the previous step
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Jumps to a specific step if all previous steps are valid
   */
  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      // Validate all previous steps before allowing navigation
      let canNavigate = true;
      for (let i = 1; i < step; i++) {
        if (!this.isStepValid(i)) {
          canNavigate = false;
          break;
        }
      }

      if (canNavigate) {
        this.currentStep = step;
      } else {
        this.markAllPreviousStepsTouched(step);
      }
    }
  }

  /**
   * Validates if the current step is complete
   */
  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Basic Information
        return !!this.questionForm.get('type')?.valid &&
          !!this.questionForm.get('difficulty')?.valid &&
          (!this.questionForm.get('questionOrder')?.value || !!this.questionForm.get('questionOrder')?.valid);

      case 2: // Question Content
        return !!this.questionForm.get('text')?.valid &&
          !!this.questionForm.get('maxMarks')?.valid &&
          this.isQuestionContentValid();

      case 3: // Media & Advanced
        return this.isMediaConfigurationValid();

      case 4: // Review
        return true; // Always valid for review step

      default:
        return false;
    }
  }

  // /**
  //  * Validates question content based on type
  //  */
  // private isQuestionContentValid(): boolean {
  //   const type = this.questionForm.get('type')?.value;

  //   switch (type) {
  //     case 'MULTIPLE_CHOICE':
  //       return this.optionsArray.length >= 2 &&
  //         this.optionsArray.valid &&
  //         !!this.questionForm.get('correctAnswer')?.valid;

  //     case 'MULTIPLE_SELECT':
  //       return this.optionsArray.length >= 2 &&
  //         this.optionsArray.valid &&
  //         this.selectedCorrectAnswers.length >= 1;

  //     case 'MATCHING':
  //       return this.matchingPairs.length >= 1 &&
  //         this.matchingPairs.valid;

  //     case 'TRUE_FALSE':
  //     case 'FILL_IN_THE_BLANK':
  //     case 'ESSAY':
  //       return !!this.questionForm.get('correctAnswer')?.valid;

  //     default:
  //       return true;
  //   }
  // }


  /**
 * Validates question content based on type
 */
private isQuestionContentValid(): boolean {
  const type = this.questionForm.get('type')?.value;
  
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return this.optionsArray.length >= 2 && 
             this.optionsArray.valid &&
             this.mcqOptions.length >= 2 &&
             !!this.questionForm.get('correctAnswer')?.value?.trim();
    
    case 'MULTIPLE_SELECT':
      const hasValidOptions = this.optionsArray.length >= 2 && 
                            this.optionsArray.valid &&
                            this.mcqOptions.length >= 2;
      const hasSelectedAnswers = this.selectedCorrectAnswers.length >= 1;
      
      console.log('MULTIPLE_SELECT Validation:', {
        hasValidOptions,
        hasSelectedAnswers,
        optionsCount: this.optionsArray.length,
        selectedCount: this.selectedCorrectAnswers.length,
        mcqOptions: this.mcqOptions
      });
      
      return hasValidOptions && hasSelectedAnswers;
    
    case 'MATCHING':
      return this.matchingPairs.length >= 1 &&
             this.matchingPairs.valid &&
             this.matchingPairs.controls.every(pair => 
               pair.get('leftText')?.valid && pair.get('rightText')?.valid
             );
    
    case 'TRUE_FALSE':
    case 'FILL_IN_THE_BLANK':
    case 'ESSAY':
      return !!this.questionForm.get('correctAnswer')?.value?.trim();
    
    default:
      return true;
  }
}

  /**
   * Validates media configuration
   */
  private isMediaConfigurationValid(): boolean {
    const mediaType = this.questionForm.get('mediaType')?.value;

    if (mediaType === 'NONE') {
      return true;
    }

    return !!this.questionForm.get('mediaPath')?.valid &&
      !!this.questionForm.get('mediaCaption')?.valid;
  }


  /**
   * Safely gets media file size in MB with proper error handling
   */
  getMediaFileSizeMB(): string {
    if (!this.mediaFile?.size) {
      return '0.00';
    }

    try {
      const sizeMB = this.mediaFile.size / (1024 * 1024);
      return sizeMB.toFixed(2);
    } catch (error) {
      console.error('Error calculating file size:', error);
      return '0.00';
    }
  }

  // Option Management Methods

  /**
   * Creates a form control for an option
   */
  createOption(value: string = ''): any {
    return this.fb.control(value, [Validators.required, Validators.minLength(1)]);
  }

  /**
   * Adds a new option to the options array
   */
  addOption() {
    if (this.optionsArray.length < 6) {
      this.optionsArray.push(this.createOption());
      this.updateOptionsAndChoices();
    }
  }

  /**
   * Removes an option from the options array
   */
  removeOption(index: number) {
    if (this.optionsArray.length > 2) {
      this.optionsArray.removeAt(index);
      this.updateOptionsAndChoices();
    }
  }

  /**
   * Handles option text changes
   */
  onOptionChange() {
    this.updateOptionsAndChoices();
  }

  // /**
  //  * Updates MCQ options and choices string
  //  */
  // private updateOptionsAndChoices() {
  //   this.mcqOptions = this.optionsArray.controls
  //     .map(control => control.value)
  //     .filter(value => value && value.trim().length > 0);

  //   this.questionForm.patchValue({
  //     choices: this.mcqOptions.join(', ')
  //   });

  //   this.questionForm.updateValueAndValidity();
  // }

  /**
 * Updates MCQ options and choices string
 */
  private updateOptionsAndChoices() {
    this.mcqOptions = this.optionsArray.controls
      .map(control => control.value)
      .filter(value => value && value.trim().length > 0);

    this.questionForm.patchValue({
      choices: this.mcqOptions.join(', ')
    });

    // Update validation state
    this.questionForm.updateValueAndValidity();
  }

  /**
   * Sets options from a choices array
   */
  private setOptions(choices: string[]) {
    this.optionsArray.clear();
    choices.forEach(choice => {
      if (choice.trim()) {
        this.optionsArray.push(this.createOption(choice.trim()));
      }
    });
    this.updateOptionsAndChoices();
  }

  /**
   * Sets selected correct answers for multiple select questions
   */
  private setSelectedCorrectAnswers(answers: string[]) {
    while (this.selectedCorrectAnswers.length) {
      this.selectedCorrectAnswers.removeAt(0);
    }
    answers.forEach(answer => {
      if (answer.trim()) {
        this.selectedCorrectAnswers.push(this.fb.control(answer.trim()));
      }
    });
  }

  // Answer Selection Methods

  /**
   * Handles correct answer selection for multiple choice
   */
  onCorrectAnswerSelect(answer: string) {
    this.questionForm.patchValue({ correctAnswer: answer });
  }

  // /**
  //  * Toggles answer selection for multiple select
  //  */
  // onMultipleAnswerToggle(answer: string) {
  //   const answerIndex = this.selectedCorrectAnswers.value.indexOf(answer);
  //   if (answerIndex > -1) {
  //     this.selectedCorrectAnswers.removeAt(answerIndex);
  //   } else {
  //     this.selectedCorrectAnswers.push(this.fb.control(answer));
  //   }
  // }


    /**
 * Toggles answer selection for multiple select and triggers validation
 */
onMultipleAnswerToggle(answer: string) {
  const answerIndex = this.selectedCorrectAnswers.value.indexOf(answer);
  
  if (answerIndex > -1) {
    this.selectedCorrectAnswers.removeAt(answerIndex);
  } else {
    this.selectedCorrectAnswers.push(this.fb.control(answer));
  }
  
  // Trigger form validation update
  this.questionForm.updateValueAndValidity();
  
  // Also update the correctAnswer field for form data preparation
  if (this.selectedCorrectAnswers.length > 0) {
    this.questionForm.patchValue({
      correctAnswer: this.selectedCorrectAnswers.value.join(', ')
    });
  }
}

  /**
   * Checks if an answer is selected
   */
  isAnswerSelected(answer: string): boolean {
    if (this.questionForm.value.type === 'MULTIPLE_SELECT') {
      return this.selectedCorrectAnswers.value.includes(answer);
    }
    return this.questionForm.get('correctAnswer')?.value === answer;
  }

  // Matching Pairs Methods

  /**
   * Creates a form group for a matching pair
   */
  createPair(left: string = '', right: string = ''): FormGroup {
    return this.fb.group({
      leftText: [left, [Validators.required, Validators.minLength(1)]],
      rightText: [right, [Validators.required, Validators.minLength(1)]]
    });
  }

  /**
   * Adds a new matching pair
   */
  addPair() {
    if (this.matchingPairs.length < 8) {
      this.matchingPairs.push(this.createPair());
    }
  }

  /**
   * Removes a matching pair
   */
  removePair(index: number) {
    if (this.matchingPairs.length > 1) {
      this.matchingPairs.removeAt(index);
    }
  }

  // Media File Handling Methods

  /**
   * Handles media file selection
   */
  onMediaFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      if (!this.isValidMediaFile(file)) {
        return;
      }

      this.mediaFile = file;

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.mediaPreview = e.target?.result as string;
          this.questionForm.patchValue({
            mediaPath: this.mediaPreview
          });
        };
        reader.readAsDataURL(file);
      } else {
        this.mediaPreview = null;
        this.questionForm.patchValue({
          mediaPath: file.name
        });
      }

      // Auto-detect media type
      this.autoDetectMediaType(file);
    }
  }

  /**
   * Validates media file type and size
   */
  private isValidMediaFile(file: File): boolean {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      this.error = 'File size must be less than 50MB';
      return false;
    }

    if (validImageTypes.includes(file.type)) {
      return true;
    } else if (validVideoTypes.includes(file.type)) {
      return true;
    } else if (validAudioTypes.includes(file.type)) {
      return true;
    } else {
      this.error = 'Unsupported file type. Please upload image, video, or audio files.';
      return false;
    }
  }

  /**
   * Gets accepted file types for file input
   */
  getAcceptFileTypes(): string {
    return '.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.ogg,.mp3,.wav';
  }

  /**
   * Auto-detects media type based on file type
   */
  private autoDetectMediaType(file: File) {
    if (file.type.startsWith('image/')) {
      this.questionForm.patchValue({ mediaType: 'IMAGE' });
    } else if (file.type.startsWith('video/')) {
      this.questionForm.patchValue({ mediaType: 'VIDEO' });
    } else if (file.type.startsWith('audio/')) {
      this.questionForm.patchValue({ mediaType: 'AUDIO' });
    }
  }

  /**
   * Switches to URL-based media
   */
  useMediaURL() {
    this.mediaFile = null;
    this.mediaPreview = null;
  }

  /**
   * Removes media attachment
   */
  removeMedia() {
    this.mediaFile = null;
    this.mediaPreview = null;
    this.questionForm.patchValue({
      mediaType: 'NONE',
      mediaPath: '',
      mediaCaption: ''
    });
  }

  // Form Submission

  // /**
  //  * Submits the question form with media upload support
  //  */
  // onSubmit(): void {
  //   if (this.questionForm.invalid) {
  //     this.markFormGroupTouched();
  //     return;
  //   }

  //   this.isLoading = true;
  //   const formData = this.prepareFormData();

  //   if (this.isEdit && this.questionId) {
  //     this.updateQuestion(formData);
  //   } else {
  //     this.createQuestion(formData);
  //   }
  // }

  onSubmit(): void {
    if (this.questionForm.invalid) {
      this.markFormGroupTouched();
      this.error = 'Please fix the validation errors before submitting.';
      this.currentStep = 1; // Go back to first step to show errors
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const formData = this.prepareFormData();

      if (this.isEdit && this.questionId) {
        this.updateQuestion(formData);
      } else {
        this.createQuestion(formData);
      }
    } catch (error) {
      this.isLoading = false;
      this.error = 'Failed to prepare form data. Please try again.';
      console.error('Form preparation error:', error);
    }
  }

  // /**
  //  * Prepares form data for submission, handling both URL and file media
  //  */
  // private prepareFormData(): FormData {
  //   const formValue = this.questionForm.value;
  //   const formData = new FormData();

  //   // Prepare question data
  //   const questionData = {
  //     ...formValue,
  //     testId: this.testId,
  //     correctAnswer: formValue.type === 'MULTIPLE_SELECT' 
  //       ? this.selectedCorrectAnswers.value.join(', ') 
  //       : formValue.correctAnswer
  //   };

  //   // Remove dynamic arrays from question data
  //   const { selectedCorrectAnswers, optionsArray, matchingPairs, ...cleanQuestionData } = questionData;

  //   // Add question data
  //   formData.append('question', JSON.stringify(cleanQuestionData));

  //   // Add media file if present
  //   if (this.mediaFile) {
  //     formData.append('mediaFile', this.mediaFile);
  //   }

  //   return formData;
  // }


  /**
 * Prepares form data for submission with proper multipart formatting
 */
  private prepareFormData(): FormData {
    const formValue = this.questionForm.value;
    const formData = new FormData();

    // Prepare question data - remove dynamic arrays and clean the object
    const questionData = {
      text: formValue.text,
      type: formValue.type,
      maxMarks: formValue.maxMarks,
      choices: formValue.choices,
      correctAnswer: formValue.type === 'MULTIPLE_SELECT'
        ? this.selectedCorrectAnswers.value.join(', ')
        : formValue.correctAnswer,
      mediaType: formValue.mediaType,
      mediaPath: formValue.mediaPath,
      mediaCaption: formValue.mediaCaption,
      difficulty: formValue.difficulty,
      category: formValue.category,
      explanation: formValue.explanation,
      questionOrder: formValue.questionOrder,
      timeLimitSeconds: formValue.timeLimitSeconds,
      allowPartialCredit: formValue.allowPartialCredit
    };

    // Add question data as JSON string
    formData.append('question', new Blob([JSON.stringify(questionData)], {
      type: 'application/json'
    }));

    // Add media file if present
    if (this.mediaFile) {
      formData.append('mediaFile', this.mediaFile, this.mediaFile.name);
    }

    // Debug: Log FormData contents
    //this.debugFormData(formData);

    return formData;
  }

  /**
   * Creates a new question
   */
  // private createQuestion(formData: FormData) {
  //   // Note: You'll need to implement this method in your ExaminerService
  //   this.examinerService.addQuestionWithMedia(this.testId, formData).subscribe({
  //     next: () => {
  //       this.isLoading = false;
  //       this.router.navigate(['/examiner/tests', this.testId, 'questions']);
  //     },
  //     error: (error) => {
  //       this.error = 'Failed to create question. ' + (error.error?.message || '');
  //       this.isLoading = false;
  //     }
  //   });
  // }


  /**
 * Creates a new question with media file support
 */
  private createQuestion(formData: FormData) {
    this.isLoading = true;

    // Use the service method but ensure it doesn't override Content-Type
    this.examinerService.addQuestionWithMedia(this.testId, formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Question created successfully:', response);
        this.router.navigate(['/examiner/tests', this.testId, 'questions']);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Failed to create question. ' + (error.error?.message || error.message || '');
        console.error('Create question error:', error);
      }
    });
  }

  // /**
  //  * Updates an existing question
  //  */
  // private updateQuestion(formData: FormData) {
  //   // Note: You'll need to implement this method in your ExaminerService
  //   this.examinerService.updateQuestionWithMedia(this.testId, this.questionId!, formData).subscribe({
  //     next: () => {
  //       this.isLoading = false;
  //       this.router.navigate(['/examiner/tests', this.testId, 'questions']);
  //     },
  //     error: (error) => {
  //       this.error = 'Failed to update question. ' + (error.error?.message || '');
  //       this.isLoading = false;
  //     }
  //   });
  // }

  /**
 * Updates an existing question with media file support
 */
  private updateQuestion(formData: FormData) {
    this.isLoading = true;

    this.examinerService.updateQuestionWithMedia(this.testId, this.questionId!, formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Question updated successfully:', response);
        this.router.navigate(['/examiner/tests', this.testId, 'questions']);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Failed to update question. ' + (error.error?.message || error.message || '');
        console.error('Update question error:', error);
      }
    });
  }

  // Utility Methods

  /**
   * Marks all controls in current step as touched
   */
  private markCurrentStepTouched() {
    const stepControls = this.getStepControls(this.currentStep);
    stepControls.forEach(controlName => {
      const control = this.questionForm.get(controlName);
      control?.markAsTouched();
    });
  }

  /**
   * Marks all previous steps as touched
   */
  private markAllPreviousStepsTouched(step: number) {
    for (let i = 1; i < step; i++) {
      const stepControls = this.getStepControls(i);
      stepControls.forEach(controlName => {
        const control = this.questionForm.get(controlName);
        control?.markAsTouched();
      });
    }
  }

  /**
   * Gets control names for a specific step
   */
  private getStepControls(step: number): string[] {
    switch (step) {
      case 1:
        return ['type', 'difficulty', 'questionOrder'];
      case 2:
        return ['text', 'maxMarks', 'correctAnswer', 'optionsArray', 'matchingPairs'];
      case 3:
        return ['mediaType', 'mediaPath', 'mediaCaption'];
      default:
        return [];
    }
  }

  /**
   * Marks entire form group as touched
   */
  private markFormGroupTouched() {
    Object.keys(this.questionForm.controls).forEach(key => {
      const control = this.questionForm.get(key);
      control?.markAsTouched();
    });
  }

  // UI Helper Methods

  /**
   * Checks if a form field is invalid
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.questionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Gets error message for a field
   */
  getFieldError(fieldName: string): string {
    const field = this.questionForm.get(fieldName);
    if (field?.errors?.['required']) return 'This field is required';
    if (field?.errors?.['minlength']) return `Minimum length is ${field.errors?.['minlength'].requiredLength} characters`;
    if (field?.errors?.['min']) return `Minimum value is ${field.errors?.['min'].min}`;
    if (field?.errors?.['email']) return 'Please enter a valid email address';
    return '';
  }

  /**
   * Formats question type for display
   */
  formatQuestionType(type: string): string {
    return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Gets question type hint text
   */
  getQuestionTypeHint(type: string): string {
    const hints: { [key: string]: string } = {
      'MULTIPLE_CHOICE': 'Students select one correct answer from several options.',
      'MULTIPLE_SELECT': 'Students select one or more correct answers from several options.',
      'TRUE_FALSE': 'Students determine if a statement is true or false.',
      'FILL_IN_THE_BLANK': 'Students type the missing word or phrase.',
      'ESSAY': 'Students write a detailed response. Requires manual grading.',
      'MATCHING': 'Students match items from two columns.'
    };
    return hints[type] || 'Configure the question details in the next step.';
  }

  /**
   * Gets option letter (A, B, C, etc.)
   */
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /**
   * Gets difficulty level color
   */
  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'EASY': 'success',
      'MEDIUM': 'warning',
      'HARD': 'danger'
    };
    return colors[difficulty] || 'secondary';
  }

  /**
   * Gets step completion status for UI indicators
   */
  getStepStatus(step: number): string {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'active';
    return 'pending';
  }


  /**
 * Toggles answer selection for multiple select and triggers validation
 */

}