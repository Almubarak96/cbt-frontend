// import { Injectable } from '@angular/core';
// import { 
//   ActivatedRouteSnapshot, 
//   RouterStateSnapshot, 
//   Router, 
//   CanActivate,
//   UrlTree 
// } from '@angular/router';
// import { Observable, of, from } from 'rxjs';
// import { map, catchError, switchMap, take } from 'rxjs/operators';
// import { AuthService } from '../../service/auth.service';
// import { TokenStorageService } from '../../service/token.storage.service';
// import { ExamService } from '../../service/exam.servise';

// @Injectable({
//   providedIn: 'root'
// })
// export class ExamGuard implements CanActivate {

//   constructor(
//     private authService: AuthService,
//     private tokenStore: TokenStorageService,
//     private examService: ExamService,
//     private router: Router
//   ) {}

//   /**
//    * Main guard method - determines if user can access the exam route
//    */
//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
//     const testId = this.getTestId(route);
//     const studentId = this.getStudentId(route);

//     // Basic parameter validation
//     if (!this.isValidId(testId)) {
//       return this.redirectToError('Invalid test ID provided');
//     }

//     // Check authentication using your TokenStorageService
//     if (!this.tokenStore.accessToken) {
//       return this.redirectToLogin(state);
//     }

//     // Verify token is not expired
//     if (this.isTokenExpired()) {
//       return this.handleTokenExpired(state);
//     }

//     // Verify the authenticated user matches the studentId
//     return this.checkStudentAuthorization(studentId, testId, route);
//   }

//   /**
//    * Extract testId from route parameters
//    */
//   private getTestId(route: ActivatedRouteSnapshot): number {
//     // Try route parameters first
//     const paramTestId = route.params['testId'];
//     if (paramTestId) return +paramTestId;

//     // Fallback to query parameters
//     const queryTestId = route.queryParams['testId'];
//     if (queryTestId) return +queryTestId;

//     return 0;
//   }

//   /**
//    * Extract studentId from route parameters or authentication
//    */
//   private getStudentId(route: ActivatedRouteSnapshot): number {
//     // Try route parameters first
//     const paramStudentId = route.params['studentId'];
//     if (paramStudentId) return +paramStudentId;

//     // Try query parameters
//     const queryStudentId = route.queryParams['studentId'];
//     if (queryStudentId) return +queryStudentId;

//     // Fallback to authenticated user from token
//     return this.getUserIdFromToken();
//   }

//   /**
//    * Get user ID from JWT token using your TokenStorageService
//    */
//   private getUserIdFromToken(): number {
//     const token = this.tokenStore.accessToken;
//     if (!token) return 0;

//     try {
//       const payload = this.parseJwt(token);
//       // Assuming sub is the user ID - adjust based on your token structure
//       return payload.sub ? +payload.sub : 0;
//     } catch {
//       return 0;
//     }
//   }

//   /**
//    * Get user role from token using your TokenStorageService
//    */
//   private getUserRoleFromToken(): string {
//     const token = this.tokenStore.accessToken;
//     if (!token) return '';

//     try {
//       const payload = this.parseJwt(token);
//       return payload.role || '';
//     } catch {
//       return '';
//     }
//   }

//   /**
//    * Parse JWT token without external dependencies
//    */
//   private parseJwt(token: string): any {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//       }).join(''));
      
//       return JSON.parse(jsonPayload);
//     } catch (error) {
//       console.error('Failed to parse JWT token:', error);
//       return {};
//     }
//   }

//   /**
//    * Check if JWT token is expired using your TokenStorageService
//    */
//   private isTokenExpired(): boolean {
//     const token = this.tokenStore.accessToken;
//     if (!token) return true;

//     try {
//       const payload = this.parseJwt(token);
//       const expiration = payload.exp * 1000; // Convert to milliseconds
//       return Date.now() >= expiration;
//     } catch {
//       return true;
//     }
//   }

//   /**
//    * Validate ID format
//    */
//   private isValidId(id: number): boolean {
//     return !isNaN(id) && id > 0;
//   }

//   /**
//    * Handle token expiration
//    */
//   private handleTokenExpired(state: RouterStateSnapshot): Observable<UrlTree> {
//     // Try to refresh token first using your AuthService
//     return from(this.tryRefreshToken()).pipe(
//       map(success => {
//         if (success) {
//           // Token refreshed successfully, continue with access check
//           return this.router.parseUrl(state.url);
//         } else {
//           // Refresh failed, redirect to login
//           return this.redirectToLogin(state);
//         }
//       }),
//       catchError(() => of(this.redirectToLogin(state)))
//     );
//   }

//   /**
//    * Attempt to refresh the access token using your AuthService
//    */
//   private async tryRefreshToken(): Promise<boolean> {
//     try {
//       // Use your AuthService's refresh method
//       const refreshToken = this.tokenStore.refreshToken;
//       if (!refreshToken) {
//         throw new Error('No refresh token available');
//       }

//       // Assuming your AuthService has a refresh method
//       await this.authService.refresh().toPromise();
//       return true;
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       // Clear invalid tokens
//       this.tokenStore.clear();
//       return false;
//     }
//   }

//   /**
//    * Check student authorization and exam access
//    */
//   private checkStudentAuthorization(
//     studentId: number, 
//     testId: number, 
//     route: ActivatedRouteSnapshot
//   ): Observable<boolean | UrlTree> {
    
//     const currentUserId = this.getUserIdFromToken();
    
//     // Check if requested student ID matches authenticated user
//     if (this.isValidId(studentId) && studentId !== currentUserId) {
//       // Admin override check
//       if (this.getUserRoleFromToken() === 'ADMIN') {
//         return of(true); // Admins can access any student's exam
//       }
//       return of(this.redirectToError('Access denied: Student ID mismatch'));
//     }

//     // Check exam access permissions using your ExamService
//     return this.checkExamAccess(currentUserId, testId, route);
//   }

//   /**
//    * Check exam access permissions using your ExamService
//    */
//   private checkExamAccess(
//     studentId: number, 
//     testId: number, 
//     route: ActivatedRouteSnapshot
//   ): Observable<boolean | UrlTree> {
    
//     // Use your ExamService's startExam method to check access
//     return this.examService.startExam(studentId, testId).pipe(
//       map(session => {
//         // If startExam succeeds, access is allowed
//         return true;
//       }),
//       catchError(error => {
//         console.error('Exam access check error:', error);
//         return this.handleExamAccessError(error, testId);
//       })
//     );
//   }

//   /**
//    * Handle exam access errors based on HTTP status codes
//    */
//   private handleExamAccessError(error: any, testId: number): Observable<UrlTree> {
//     const status = error.status;
    
//     switch (status) {
//       case 404:
//         return of(this.redirectToExamNotFound(testId));
      
//       case 403:
//         return of(this.redirectToAccessDenied());
      
//       case 400:
//         return of(this.redirectToError('Invalid exam request'));
      
//       case 409:
//         return of(this.redirectToExamCompleted(testId));
      
//       case 401:
//         return of(this.redirectToLoginWithMessage('Session expired. Please login again.'));
      
//       default:
//         return of(this.redirectToError('Unable to access exam. Please try again later.'));
//     }
//   }

//   /**
//    * Redirect to exam not found page
//    */
//   private redirectToExamNotFound(testId: number): UrlTree {
//     return this.router.createUrlTree(['/exam-not-found'], {
//       queryParams: { testId }
//     });
//   }

//   /**
//    * Redirect to access denied page
//    */
//   private redirectToAccessDenied(): UrlTree {
//     return this.router.createUrlTree(['/access-denied']);
//   }

//   /**
//    * Redirect to exam completed page
//    */
//   private redirectToExamCompleted(testId: number): UrlTree {
//     return this.router.createUrlTree(['/exam-completed'], {
//       queryParams: { testId }
//     });
//   }

//   /**
//    * Redirect to login with return URL and message
//    */
//   private redirectToLoginWithMessage(message: string): UrlTree {
//     return this.router.createUrlTree(['/login'], {
//       queryParams: { message: encodeURIComponent(message) }
//     });
//   }

//   /**
//    * Redirect to login with return URL
//    */
//   private redirectToLogin(state: RouterStateSnapshot): UrlTree {
//     return this.router.createUrlTree(['/login'], {
//       queryParams: { returnUrl: state.url }
//     });
//   }

//   /**
//    * Redirect to generic error page
//    */
//   private redirectToError(message: string): UrlTree {
//     return this.router.createUrlTree(['/error'], {
//       queryParams: { message: encodeURIComponent(message) }
//     });
//   }

//   /**
//    * Optional: CanDeactivate guard for preventing accidental navigation away
//    */
//   canDeactivate(
//     component: unknown,
//     currentRoute: ActivatedRouteSnapshot,
//     currentState: RouterStateSnapshot,
//     nextState?: RouterStateSnapshot
//   ): Observable<boolean> | Promise<boolean> | boolean {
    
//     // Prevent navigation away from active exam without confirmation
//     if (this.isExamInProgress() && !this.isAllowedNavigation(nextState)) {
//       return confirm('Are you sure you want to leave? Your progress may be lost.');
//     }
    
//     return true;
//   }

//   /**
//    * Check if exam is in progress using session storage
//    */
//   private isExamInProgress(): boolean {
//     return sessionStorage.getItem('examInProgress') === 'true';
//   }

//   /**
//    * Define allowed navigation paths during exam
//    */
//   private isAllowedNavigation(nextState?: RouterStateSnapshot): boolean {
//     if (!nextState) return false;
    
//     const allowedPaths = [
//       '/exam-summary',
//       '/exam-completed',
//       '/help',
//       '/technical-support',
//       '/login' // Allow login if session expired
//     ];
    
//     return allowedPaths.some(path => nextState.url.startsWith(path));
//   }
// }