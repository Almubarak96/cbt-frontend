//  import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { catchError, map, Observable, of } from 'rxjs';
// import { PageResponse } from '../models/pageresponse.dto';
// import { AnswerDTO } from '../models/answer.dto';
// import { AuthService } from './auth.service';


// export interface ExamAccess {
//   allowed: boolean;
//   reason?: string;
//   sessionId?: number;
// }

// @Injectable({ providedIn: 'root' })
// export class ExamService {
//   private api = 'http://localhost:8080/api/student/exam';
//   private apii = 'http://localhost:8080/api/exam';

//   constructor(private http: HttpClient, private authSerice: AuthService) { }

//  /*  startExam(studentId: number, testId: number): Observable<any> {
//     return this.http.post(`${this.apii}/start/${studentId}/${testId}`, {});
//   } */

//    startExam(testId: number): Observable<any> {
//   const headers = {
//     Authorization: `Bearer ${this.authSerice.getAccessToken()}`
//   };
//   return this.http.post(`${this.apii}/start/${testId}`, {}, { headers });
// } 


//   getPages(sessionId: number, questionsPerPage = 3): Observable<any> {
//     return this.http.get(`${this.api}/pages/${sessionId}?questionsPerPage=${questionsPerPage}`);
//   }


//   getQuestions( page: number, size: number): Observable<PageResponse> {
//     return this.http.get<PageResponse>(
//       `${this.apii}/questions?page=${page}&size=${size}`
//     );
//   }


//   getAllQuestionIds() {
//     return this.http.get<number[]>(
//       `${this.apii}/question-ids`
//     );
//   }


//   saveAnswers(answers: AnswerDTO[]): Observable<void> {
//     return this.http.patch<void>(`${this.apii}/answers`, answers);
//   }

//   completeExam(): Observable<void> {
//     return this.http.post<void>(`${this.apii}/complete`, {});
//   }

//   resumeExam(): Observable<any> {
//     return this.http.get<any>(`${this.apii}/resume`);
//   }


//   getTimeLeft(): Observable<number> {
//     return this.http.get<number>(`${this.apii}/time-left`);
//   }


//  /*   getQuestionMap(sessionId: number) {
//     return this.http.get<{ id: number; answered: boolean }[]>(
//       `${this.apii}/${sessionId}/question-map`
//     );
//   }  */


// getQuestionMap(): Observable<{
//   [key: string]: { questionId: number; answered: boolean; type: string; number: number }[];
// }> {
//   return this.http.get<{
//     [key: string]: { questionId: number; answered: boolean; type: string; number: number }[];
//   }>(`${this.apii}/question-map`);
// } 





//   /**
//    * Check if student can access the test
//    * This method uses startExam but doesn't actually start the exam
//    */
//   canStudentAccessTest(studentId: number, testId: number): Observable<ExamAccess> {
//     return this.http.post<any>(
//       `${this.apii}/start/${testId}`,
//       {},
//       { observe: 'response' }
//     ).pipe(
//       map(response => {
//         // If we get a successful response, access is allowed
//         return {
//           allowed: true,
//           sessionId: response.body?.sessionId
//         };
//       }),
//       catchError(error => {
//         // Map HTTP errors to access denial reasons
//         let reason = 'unknown_error';

//         switch (error.status) {
//           case 404:
//             reason = 'exam_not_found';
//             break;
//           case 403:
//             reason = 'access_denied';
//             break;
//           case 409:
//             reason = 'exam_completed';
//             break;
//           case 400:
//             reason = 'invalid_request';
//             break;
//         }

//         return of({ allowed: false, reason });
//       })
//     );
//   }


//   /**
//    * Alternative: Check access without starting exam
//    * This would require a backend endpoint like /api/exam/access-check/{studentId}/{testId}
//    */
//   checkExamAccess(studentId: number, testId: number): Observable<ExamAccess> {
//     return this.http.get<ExamAccess>(
//       `${this.apii}/access-check/${studentId}/${testId}`
//     ).pipe(
//       catchError(error => {
//         console.error('Access check failed:', error);
//         return of({ allowed: false, reason: 'server_error' });
//       })
//     );
//   }








//   /***Exams Instructions Methods */
//   // New methods for instructions
//   getInstructions(examId: number): Observable<any> {
//     return this.http.get(`${this.apii}/instructions/${examId}`);
//   }

//   acknowledgeInstructions(examId: number): Observable<any> {
//     return this.http.post(`${this.apii}/instructions/${examId}/acknowledge`, {});
//   }

//   hasUserReadInstructions(examId: number): Observable<any> {
//     return this.http.get(`${this.apii}/instructions/${examId}/status`);
//   }
//   /***End Exams Instructions Methods */








//   // In exam.service.ts
//   /**
//    * Retrieves exam results for a specific session
//    * @param sessionId The exam session ID
//    * @returns Observable with exam result data
//    */
//   getExamResults(sessionId: number): Observable<any> {
//     return this.http.get(`${this.apii}/exam/${sessionId}/results`);
//   }

//   // In student-answer.service.ts
//   /**
//    * Retrieves all answers for a specific exam session
//    * @param sessionId The exam session ID
//    * @returns Observable with array of student answers
//    */
//   getExamAnswers(sessionId: number): Observable<any[]> {
//     return this.http.get<any[]>(`${this.apii}/answers/exam/${sessionId}`);
//   }



//   getQuestionsByType(type: string, page: number, size: number): Observable<PageResponse> {
//   return this.http.get<PageResponse>(
//     `${this.apii}/questions/by-type?type=${type}&page=${page}&size=${size}`
//   );
//   }

// }











import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { PageResponse } from '../models/pageresponse.dto';
import { AnswerDTO } from '../models/answer.dto';
import { AuthService } from './auth.service';

export interface ExamAccess {
  allowed: boolean;
  reason?: string;
  sessionId?: number;
}

export interface GradingStatus {
  sessionId: number;
  examStatus: string;
  graded: boolean;
  totalQuestions: number;
  autoGradedQuestions: number;
  essayQuestions: number;
  gradedEssays: number;
  pendingEssays: number;
  allEssaysGraded: boolean;
  completionPercentage: number;
}

export interface ImmediateResultsResponse {
  status: 'READY' | 'PENDING' | 'ERROR' | 'TIMEOUT';
  data?: any;
  gradingStatus?: GradingStatus;
  message?: string;
  sessionId?: number;
}


export interface StudentProfile {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  department: string;
  program: string;
  semester: number;
  contactNumber: string;
  dateOfBirth: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

@Injectable({ providedIn: 'root' })
export class ExamService {
 
  private api = 'http://localhost:8080/api/student/exam';
  private apii = 'http://localhost:8080/api/exam';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.authService.getAccessToken()}`
    };
  }

  startExam(testId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apii}/start/${testId}`, {}, { headers });
  }

  getPages(sessionId: number, questionsPerPage = 3): Observable<any> {
    return this.http.get(`${this.api}/pages/${sessionId}?questionsPerPage=${questionsPerPage}`);
  }

  // FIXED: Added testId parameter
  getQuestions(testId: number, page: number, size: number): Observable<PageResponse> {
    const params = new HttpParams()
      .set('testId', testId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse>(
      `${this.apii}/questions`,
      { params, headers: this.getHeaders() }
    );
  }

  // FIXED: Added testId parameter
  getAllQuestionIds(testId: number): Observable<number[]> {
    const params = new HttpParams()
      .set('testId', testId.toString());

    return this.http.get<number[]>(
      `${this.apii}/question-ids`,
      { params, headers: this.getHeaders() }
    );
  }

  // FIXED: Added testId parameter
  saveAnswers(testId: number, answers: AnswerDTO[]): Observable<void> {
    const params = new HttpParams()
      .set('testId', testId.toString());

    return this.http.patch<void>(
      `${this.apii}/answers`,
      answers,
      { params, headers: this.getHeaders() }
    );
  }

  // FIXED: Added testId parameter
  completeExam(testId: number): Observable<void> {
    const params = new HttpParams()
      .set('testId', testId.toString());

    return this.http.post<void>(
      `${this.apii}/complete`,
      {},
      { params, headers: this.getHeaders() }
    );
  }

  // FIXED: Added testId parameter (if you have a resume endpoint)
  resumeExam(testId: number): Observable<any> {
    const params = new HttpParams()
      .set('testId', testId.toString());

    return this.http.get<any>(
      `${this.apii}/resume`,
      { params, headers: this.getHeaders() }
    );
  }

  // FIXED: Added testId parameter
  getTimeLeft(testId: number): Observable<number> {
    const params = new HttpParams()
      .set('testId', testId.toString());

    return this.http.get<number>(
      `${this.apii}/time-left`,
      { params, headers: this.getHeaders() }
    );
  }

  // FIXED: Added testId parameter
  getQuestionMap(testId: number): Observable<{
    [key: string]: { questionId: number; answered: boolean; type: string; number: number }[];
  }> {
    const params = new HttpParams()
      .set('testId', testId.toString());

    return this.http.get<{
      [key: string]: { questionId: number; answered: boolean; type: string; number: number }[];
    }>(`${this.apii}/question-map`, { params, headers: this.getHeaders() });
  }

  // FIXED: Added testId parameter for questions by type
  getQuestionsByType(testId: number, type: string, page: number, size: number): Observable<PageResponse> {
    const params = new HttpParams()
      .set('testId', testId.toString())
      .set('type', type)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse>(
      `${this.apii}/questions/by-type`,
      { params, headers: this.getHeaders() }
    );
  }

  // NEW: Get session ID for a test
  getSessionId(testId: number): Observable<number> {
    const params = new HttpParams()
      .set('testId', testId.toString());

    return this.http.get<number>(
      `${this.apii}/session-id`,
      { params, headers: this.getHeaders() }
    );
  }

  /**
   * Check if student can access the test
   */
  canStudentAccessTest(testId: number): Observable<ExamAccess> {
    return this.startExam(testId).pipe(
      map(response => {
        return {
          allowed: true,
          sessionId: response?.sessionId
        };
      }),
      catchError(error => {
        let reason = 'unknown_error';
        switch (error.status) {
          case 404:
            reason = 'exam_not_found';
            break;
          case 403:
            reason = 'access_denied';
            break;
          case 409:
            reason = 'exam_completed';
            break;
          case 400:
            reason = 'invalid_request';
            break;
          case 412: // PRECONDITION_FAILED - instructions not read
            reason = 'instructions_not_read';
            break;
        }
        return of({ allowed: false, reason });
      })
    );
  }

  /*** Exams Instructions Methods */
  getInstructions(examId: number): Observable<any> {
    return this.http.get(`${this.apii}/instructions/${examId}`, { headers: this.getHeaders() });
  }

  acknowledgeInstructions(examId: number): Observable<any> {
    return this.http.post(`${this.apii}/instructions/${examId}/acknowledge`, {}, { headers: this.getHeaders() });
  }

  hasUserReadInstructions(examId: number): Observable<any> {
    return this.http.get(`${this.apii}/instructions/${examId}/status`, { headers: this.getHeaders() });
  }
  /*** End Exams Instructions Methods */

  /**
   * Retrieves exam results for a specific session
   */
  getExamResults(sessionId: number): Observable<any> {
    return this.http.get(`${this.apii}/exam/${sessionId}/results`, { headers: this.getHeaders() });
  }

  /**
   * Retrieves all answers for a specific exam session
   */
  getExamAnswers(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apii}/answers/exam/${sessionId}`, { headers: this.getHeaders() });
  }



    // NEW METHODS FOR IMMEDIATE RESULTS

  /**
   * Get immediate results with status check
   */


    private resultsApi = 'http://localhost:8080/api/student/results';
    
    /**
 * Get immediate results with better error handling
 */
getImmediateResults(sessionId: number): Observable<any> {
  return this.http.get<any>(
    `${this.resultsApi}/immediate/${sessionId}`,
    { headers: this.getHeaders() }
  ).pipe(
    catchError(error => {
      console.error('Error getting immediate results:', error);
      // Return a structured error response instead of throwing
      return of({
        resultsStatus: 'ERROR',
        error: error.message
      });
    })
  );
}
  

  /**
   * Get grading status
   */
  getGradingStatus(sessionId: number): Observable<GradingStatus> {
    return this.http.get<GradingStatus>(
      `${this.resultsApi}/${sessionId}/status`,
      { headers: this.getHeaders() }
    );
  }


/**
 * Trigger immediate grading with better error handling
 */
triggerGrading(sessionId: number): Observable<any> {
  return this.http.post<any>(
    `${this.resultsApi}/${sessionId}/trigger-grading`,
    {},
    { headers: this.getHeaders() }
  ).pipe(
    catchError(error => {
      console.error('Error triggering grading:', error);
      throw error; // Re-throw so component can handle it
    })
  );
}


  /**
   * Utility method to create a timer observable
   */
  startTimer(interval: number): Observable<number> {
    return new Observable<number>(observer => {
      let counter = 0;
      const timerId = setInterval(() => {
        counter++;
        observer.next(counter);
      }, interval);

      return () => {
        clearInterval(timerId);
      };
    });
  }

  

/**
 * Simple results polling that handles immediate results for non-essay exams
 */
smartResultsPolling(sessionId: number, maxAttempts = 20, interval = 2000): Observable<ImmediateResultsResponse> {
  return new Observable(observer => {
    let attempts = 0;
    
    const checkResults = () => {
      this.getImmediateResults(sessionId).subscribe({
        next: (response) => {
          attempts++;
          console.log(`Polling attempt ${attempts}:`, response);
          
          // SIMPLE LOGIC: If results are ready, return them
          if (response.resultsStatus === 'READY' && response.results) {
            observer.next({
              status: 'READY',
              data: response.results,
              sessionId: sessionId
            });
            observer.complete();
          } 
          // If we have grading status info, include it
          else if (response.gradingStatus) {
            observer.next({
              status: 'PENDING',
              gradingStatus: response.gradingStatus,
              sessionId: sessionId
            });
            
            // Continue polling unless we've reached max attempts
            if (attempts < maxAttempts) {
              setTimeout(checkResults, interval);
            } else {
              observer.next({
                status: 'TIMEOUT',
                gradingStatus: response.gradingStatus,
                sessionId: sessionId,
                message: 'Maximum polling attempts reached'
              });
              observer.complete();
            }
          }
          // No results and no grading status - continue polling
          else {
            observer.next({
              status: 'PENDING',
              sessionId: sessionId
            });
            
            if (attempts < maxAttempts) {
              setTimeout(checkResults, interval);
            } else {
              observer.next({
                status: 'TIMEOUT',
                sessionId: sessionId,
                message: 'Results not available after maximum attempts'
              });
              observer.complete();
            }
          }
        },
        error: (err) => {
          attempts++;
          console.error(`Polling error attempt ${attempts}:`, err);
          
          if (attempts >= maxAttempts) {
            observer.next({
              status: 'ERROR',
              message: 'Failed to check results status after multiple attempts',
              sessionId: sessionId
            });
            observer.complete();
          } else {
            // Continue polling on error
            observer.next({
              status: 'PENDING',
              sessionId: sessionId
            });
            setTimeout(checkResults, interval);
          }
        }
      });
    };
    
    // Start the polling
    checkResults();
  });
}
















    /**
   * Get student profile data
   */
  getStudentProfile(): Observable<StudentProfile> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<StudentProfile>(`${this.apii}/profile`, { headers })
      .pipe(
        map(response => this.transformStudentProfile(response)),
        catchError(error => {
          console.error('Error fetching student profile:', error);
          // Return mock data for development/demo purposes
          return of(this.getMockStudentProfile());
        })
      );
  }

  /**
   * Transform the API response to match our StudentProfile interface
   */
  private transformStudentProfile(response: any): StudentProfile {
    return {
      id: response.id || response.studentId || 0,
      studentId: response.studentId || response.studentCode || 'N/A',
      fullName: response.fullName || response.name || `${response.firstName || ''} ${response.lastName || ''}`.trim() || 'Student',
      email: response.email || response.contactEmail || 'student@university.edu',
      avatarUrl: response.avatarUrl || response.profilePicture || response.imageUrl || null,
      department: response.department || response.departmentName || 'Computer Science',
      program: response.program || response.programName || 'Bachelor of Technology',
      semester: response.semester || response.currentSemester || 1,
      contactNumber: response.contactNumber || response.phone || response.mobile || '+1234567890',
      dateOfBirth: response.dateOfBirth || response.dob || '2000-01-01',
      enrollmentDate: response.enrollmentDate || response.admissionDate || '2023-09-01',
      status: response.status || 'ACTIVE'
    };
  }

  /**
   * Mock student profile for development/demo purposes
   */
  private getMockStudentProfile(): StudentProfile {
    const mockAvatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    ];

    const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa'];
    const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Thomas'];
    const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Mathematics', 'Physics'];
    const programs = ['Bachelor of Technology', 'Bachelor of Science', 'Bachelor of Engineering', 'Master of Technology'];

    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
    const randomProgram = programs[Math.floor(Math.random() * programs.length)];

    return {
      id: Math.floor(Math.random() * 1000) + 1,
      studentId: `STU${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      fullName: `${randomFirstName} ${randomLastName}`,
      email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@university.edu`,
      avatarUrl: mockAvatars[Math.floor(Math.random() * mockAvatars.length)],
      department: randomDepartment,
      program: randomProgram,
      semester: Math.floor(Math.random() * 8) + 1,
      contactNumber: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      dateOfBirth: `199${Math.floor(Math.random() * 10)}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
      enrollmentDate: `202${Math.floor(Math.random() * 4)}-09-01`,
      status: 'ACTIVE'
    };
  }

  /**
   * Update student profile (if needed)
   */
  updateStudentProfile(profile: Partial<StudentProfile>): Observable<StudentProfile> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<StudentProfile>(`${this.apii}/profile`, profile, { headers })
      .pipe(
        catchError(error => {
          console.error('Error updating student profile:', error);
          throw error;
        })
      );
  }

  /**
   * Upload student avatar
   */
  uploadStudentAvatar(imageFile: File): Observable<{ avatarUrl: string }> {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('avatar', imageFile);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Note: Don't set Content-Type for FormData, let browser set it
    });

    return this.http.post<{ avatarUrl: string }>(`${this.apii}/profile/avatar`, formData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error uploading avatar:', error);
          throw error;
        })
      );
  }

  /**
   * Get student academic info
   */
  getStudentAcademicInfo(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apii}/academic-info`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching academic info:', error);
          return of(this.getMockAcademicInfo());
        })
      );
  }

  private getMockAcademicInfo(): any {
    return {
      cgpa: (Math.random() * 4).toFixed(2),
      creditsCompleted: Math.floor(Math.random() * 120) + 60,
      currentSemester: Math.floor(Math.random() * 8) + 1,
      attendancePercentage: (Math.random() * 30 + 70).toFixed(1),
      coursesEnrolled: Math.floor(Math.random() * 6) + 4
    };
  }
  

}
