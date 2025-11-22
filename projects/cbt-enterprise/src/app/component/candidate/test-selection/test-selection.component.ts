import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../../service/exam.servise';
import { EnrolledTestsService } from '../../../service/enrolled-tests.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-selection',
  templateUrl: './test-selection.component.html',
  styleUrls: ['./test-selection.component.scss'],
  imports: [CommonModule]
})
export class TestSelectionComponent implements OnInit {
  tests: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private examService: ExamService, 
    private router: Router,
    private enrollmentService: EnrolledTestsService
  ) {}

  ngOnInit(): void {
    this.loadEnrolledTests();
  }

  loadEnrolledTests() {
    this.loading = true;
    this.enrollmentService.getEnrolledTests().subscribe({
      next: (tests) => {
        this.tests = tests;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load enrolled tests.';
        this.loading = false;
      }
    });
  }

  startTest(testId: number) {
    // REMOVED: The exam start logic
    // JUST navigate to the test session with the test ID
    this.router.navigate(['/student/test-session', testId]);
  }
}