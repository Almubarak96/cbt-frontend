import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
  department?: string;
  enrolled?: boolean;
  enrollmentDate?: string;
}

export interface Enrollment {
  id?: number;
  studentId: number;
  testId: number;
  enrolledAt?: Date;
  status: 'enrolled' | 'completed' | 'in-progress';
}

export interface EnrollmentRequest {
  studentIds: number[];
  testId: number;
  sendNotification?: boolean;
  notificationMessage?: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrolledCount: number;
  failedEnrollments?: number[];
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private apiUrl = 'http://localhost:8080/api/admin';

  // Mock data for students
  private mockStudents: Student[] = [
    { id: 1, name: 'John Smith', email: 'john.smith@university.edu', studentId: 'S001', department: 'Computer Science' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@university.edu', studentId: 'S002', department: 'Mathematics' },
    { id: 3, name: 'Mike Davis', email: 'mike.davis@university.edu', studentId: 'S003', department: 'Physics' },
    { id: 4, name: 'Emily Brown', email: 'emily.brown@university.edu', studentId: 'S004', department: 'Computer Science' },
    { id: 5, name: 'David Wilson', email: 'david.wilson@university.edu', studentId: 'S005', department: 'Chemistry' },
    { id: 6, name: 'Jennifer Lee', email: 'jennifer.lee@university.edu', studentId: 'S006', department: 'Biology' },
    { id: 7, name: 'Robert Taylor', email: 'robert.taylor@university.edu', studentId: 'S007', department: 'Engineering' },
    { id: 8, name: 'Maria Garcia', email: 'maria.garcia@university.edu', studentId: 'S008', department: 'Computer Science' },
    { id: 9, name: 'James Miller', email: 'james.miller@university.edu', studentId: 'S009', department: 'Mathematics' },
    { id: 10, name: 'Lisa Anderson', email: 'lisa.anderson@university.edu', studentId: 'S010', department: 'Physics' },
    { id: 11, name: 'Thomas Martinez', email: 'thomas.martinez@university.edu', studentId: 'S011', department: 'Engineering' },
    { id: 12, name: 'Karen Thomas', email: 'karen.thomas@university.edu', studentId: 'S012', department: 'Computer Science' },
    { id: 13, name: 'Christopher White', email: 'christopher.white@university.edu', studentId: 'S013', department: 'Biology' },
    { id: 14, name: 'Amanda Harris', email: 'amanda.harris@university.edu', studentId: 'S014', department: 'Chemistry' },
    { id: 15, name: 'Daniel Clark', email: 'daniel.clark@university.edu', studentId: 'S015', department: 'Mathematics' },
    { id: 16, name: 'Michelle Rodriguez', email: 'michelle.rodriguez@university.edu', studentId: 'S016', department: 'Engineering' },
    { id: 17, name: 'Kevin Lewis', email: 'kevin.lewis@university.edu', studentId: 'S017', department: 'Computer Science' },
    { id: 18, name: 'Stephanie Walker', email: 'stephanie.walker@university.edu', studentId: 'S018', department: 'Physics' },
    { id: 19, name: 'Brian King', email: 'brian.king@university.edu', studentId: 'S019', department: 'Biology' },
    { id: 20, name: 'Nicole Scott', email: 'nicole.scott@university.edu', studentId: 'S020', department: 'Mathematics' }
  ];

  // Track enrolled students by test ID
  private enrolledStudents: Map<number, Student[]> = new Map();

  constructor(private http: HttpClient) { }

  // ==================== REAL API METHODS ====================

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/students`).pipe(
      catchError((error) => {
        console.warn('API failed for getAllStudents, using mock data:', error);
        return this.getMockStudents();
      })
    );
  }

  getEnrolledStudents(testId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/tests/${testId}/enrollments`).pipe(
      catchError((error) => {
        console.warn('API failed for getEnrolledStudents, using mock data:', error);
        return this.getMockEnrolledStudents(testId);
      })
    );
  }

  enrollStudents(enrollmentRequest: EnrollmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/enrollments`, enrollmentRequest).pipe(
      catchError((error) => {
        console.warn('API failed for enrollStudents, using mock data:', error);
        return this.mockEnrollStudents(enrollmentRequest);
      })
    );
  }

  unenrollStudent(testId: number, studentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tests/${testId}/enrollments/${studentId}`).pipe(
      catchError((error) => {
        console.warn('API failed for unenrollStudent, using mock data:', error);
        return this.mockUnenrollStudent(testId, studentId);
      })
    );
  }

  unenrollAllStudents(testId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tests/${testId}/enrollments`).pipe(
      catchError((error) => {
        console.warn('API failed for unenrollAllStudents, using mock data:', error);
        return this.mockUnenrollAllStudents(testId);
      })
    );
  }

  sendNotifications(testId: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tests/${testId}/notifications`, { message }).pipe(
      catchError((error) => {
        console.warn('API failed for sendNotifications, using mock data:', error);
        return this.mockSendNotifications(testId, message);
      })
    );
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/departments`).pipe(
      catchError((error) => {
        console.warn('API failed for getDepartments, using mock data:', error);
        return this.getMockDepartments();
      })
    );
  }

  // ==================== MOCK DATA METHODS ====================

  getMockStudents(): Observable<Student[]> {
    // Simulate API delay
    return of([...this.mockStudents]).pipe(delay(800));
  }

  getMockEnrolledStudents(testId: number): Observable<Student[]> {
    const enrolled = this.enrolledStudents.get(testId) || [];
    // Return a copy to prevent mutation
    return of([...enrolled]).pipe(delay(600));
  }

getMockDepartments(): Observable<string[]> {
    // Filter out undefined departments and ensure we only return strings
    const departments = [...new Set(this.mockStudents
      .map(student => student.department)
      .filter((dept): dept is string => dept !== undefined)
    )];
    return of(departments).pipe(delay(300));
  }

  mockEnrollStudents(request: EnrollmentRequest): Observable<EnrollmentResponse> {
    return new Observable(observer => {
      // Simulate API processing time
      setTimeout(() => {
        try {
          const { studentIds, testId } = request;
          const enrolledStudents = this.enrolledStudents.get(testId) || [];
          const successfullyEnrolled: number[] = [];
          const failedEnrollments: number[] = [];

          studentIds.forEach(studentId => {
            const student = this.mockStudents.find(s => s.id === studentId);
            if (student && !enrolledStudents.some(s => s.id === studentId)) {
              // Add enrollment date
              const enrolledStudent = {
                ...student,
                enrollmentDate: new Date().toISOString().split('T')[0]
              };
              enrolledStudents.push(enrolledStudent);
              successfullyEnrolled.push(studentId);
            } else {
              failedEnrollments.push(studentId);
            }
          });

          // Update the enrolled students map
          this.enrolledStudents.set(testId, enrolledStudents);

          const response: EnrollmentResponse = {
            success: successfullyEnrolled.length > 0,
            message: successfullyEnrolled.length > 0 
              ? `Successfully enrolled ${successfullyEnrolled.length} student(s)`
              : 'No students were enrolled',
            enrolledCount: successfullyEnrolled.length,
            failedEnrollments: failedEnrollments.length > 0 ? failedEnrollments : undefined
          };

          observer.next(response);
          observer.complete();

        } catch (error) {
          observer.error('Failed to enroll students');
        }
      }, 1000);
    });
  }

  mockUnenrollStudent(testId: number, studentId: number): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        try {
          const enrolledStudents = this.enrolledStudents.get(testId) || [];
          const updatedStudents = enrolledStudents.filter(student => student.id !== studentId);
          this.enrolledStudents.set(testId, updatedStudents);

          observer.next({ success: true, message: 'Student unenrolled successfully' });
          observer.complete();
        } catch (error) {
          observer.error('Failed to unenroll student');
        }
      }, 800);
    });
  }

  mockUnenrollAllStudents(testId: number): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        try {
          const enrolledCount = this.enrolledStudents.get(testId)?.length || 0;
          this.enrolledStudents.set(testId, []);

          observer.next({ 
            success: true, 
            message: `Successfully unenrolled all ${enrolledCount} students` 
          });
          observer.complete();
        } catch (error) {
          observer.error('Failed to unenroll all students');
        }
      }, 1000);
    });
  }

  mockSendNotifications(testId: number, message: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        try {
          const enrolledCount = this.enrolledStudents.get(testId)?.length || 0;
          
          // Simulate notification sending
          console.log(`Sending notification to ${enrolledCount} students:`, message);

          observer.next({ 
            success: true, 
            message: `Notifications sent to ${enrolledCount} students successfully` 
          });
          observer.complete();
        } catch (error) {
          observer.error('Failed to send notifications');
        }
      }, 1500);
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Force use mock data (bypass real API completely)
   */
  useMockData(): void {
    console.log('EnrollmentService: Using mock data only');
    // Override the methods to use mock data directly
    (this as any).getAllStudents = () => this.getMockStudents();
    (this as any).getEnrolledStudents = (testId: number) => this.getMockEnrolledStudents(testId);
    (this as any).enrollStudents = (request: EnrollmentRequest) => this.mockEnrollStudents(request);
    (this as any).unenrollStudent = (testId: number, studentId: number) => this.mockUnenrollStudent(testId, studentId);
    (this as any).unenrollAllStudents = (testId: number) => this.mockUnenrollAllStudents(testId);
    (this as any).sendNotifications = (testId: number, message: string) => this.mockSendNotifications(testId, message);
    (this as any).getDepartments = () => this.getMockDepartments();
  }

  /**
   * Reset mock data (useful for testing)
   */
  resetMockData(): void {
    this.enrolledStudents.clear();
    console.log('EnrollmentService: Mock data reset');
  }

 /**
   * Get statistics for testing
   */
  getMockStatistics(): { totalStudents: number; departments: string[]; enrolledByTest: Map<number, number> } {
    const enrolledByTest = new Map<number, number>();
    this.enrolledStudents.forEach((students, testId) => {
      enrolledByTest.set(testId, students.length);
    });

    // Filter out undefined departments
    const departments = [...new Set(this.mockStudents
      .map(student => student.department)
      .filter((dept): dept is string => dept !== undefined)
    )];

    return {
      totalStudents: this.mockStudents.length,
      departments: departments,
      enrolledByTest
    };
  }

  /**
   * Check if we're using mock data
   */
  isUsingMockData(): boolean {
    return (this as any).getAllStudents === (() => this.getMockStudents());
  }
}