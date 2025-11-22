import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Test {
  id: number;
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  published: boolean;
}

@Injectable({ providedIn: 'root' })
export class EnrolledTestsService {
  private apiUrl = 'http://localhost:8080/api/student';

  constructor(private http: HttpClient) { }

  // Get all tests that the student is enrolled in
  getEnrolledTests(): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/enrolled-tests`);
  }

  // Check if student is enrolled in a specific test
  isStudentEnrolled(studentId: number, testId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/enrolled-tests/${testId}/check`);
  }
}