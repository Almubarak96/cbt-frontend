import { Component } from '@angular/core';
import { ExamService } from '../../../service/exam.servise';
import { Router } from '@angular/router';
import { ExaminerService } from '../../../service/exaimner.service';
import { TestModel } from '../../../models/test.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-tests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-tests.component.html',
  styleUrl: './student-tests.component.scss'
})
export class StudentTestsComponent {

 availableTests: TestModel[] = [];
  isLoading = true;
  errorMessage = '';


  constructor(
    private examService: ExaminerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAvailableTests();
  }

  loadAvailableTests() {
    this.isLoading = true;
    this.examService.getTests().subscribe({
      next: (tests) => {
        this.availableTests = tests;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load exams. Please try again.';
        this.isLoading = false;
        console.error('Error loading tests:', error);
      }
    });
  }

  startExam(testId: number) {
    // Get current user ID from authentication
    const studentId = this.getCurrentStudentId();
    
   

    // Navigate to exam session with dynamic parameters
    this.router.navigate(['/exam', studentId, testId]);
  }

  canTakeExam(test: TestModel): boolean {
    // Add your logic here - check if test is available, not completed, etc.
    return  true;//test.published && !test.completed;
  }

  private getCurrentStudentId(): number {
    // Get from token or auth service
    const token = localStorage.getItem('cbt.accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub ? +payload.sub : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }
}
