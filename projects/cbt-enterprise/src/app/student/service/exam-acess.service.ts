import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ExamAccess {
  allowed: boolean;
  reason?: string;
  exam?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ExamAcessService {

  constructor() { }

  canStudentAccessTest(studentId: number, testId: number): Observable<ExamAccess> {
    // Implement actual API call to backend
    // This is a mock implementation
    return of(this.mockAccessCheck(studentId, testId)).pipe(delay(100));
  }

  private mockAccessCheck(studentId: number, testId: number): ExamAccess {
    // Mock logic - replace with actual API call
    if (testId === 999) {
      return { allowed: false, reason: 'exam_not_found' };
    }
    
    if (testId === 888) {
      return { allowed: false, reason: 'exam_completed' };
    }
    
    if (testId === 777) {
      return { allowed: false, reason: 'no_attempts_left' };
    }
    
    // Default: allow access
    return { allowed: true };
  }
}