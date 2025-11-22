// // proctor.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface ExamSession {
//   sessionId: number;
//   testId: number;
//   testTitle: string;
//   studentId: number;
//   studentName: string;
//   studentEmail: string;
//   startTime: string;
//   endTime?: string;
//   status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';
//   durationMinutes: number;
//   timeRemaining: number;
//   violations: number;
//   lastActivity: string;
//   connectionStatus: 'ONLINE' | 'OFFLINE' | 'UNSTABLE';
//   flagged: boolean;
// }

// export interface LiveMonitoringData {
//   sessionId: number;
//   studentId: number;
//   studentName: string;
//   webcamStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
//   screenStatus: 'SHARING' | 'NOT_SHARING' | 'BLOCKED';
//   audioStatus: 'ACTIVE' | 'MUTED' | 'BLOCKED';
//   focusStatus: 'IN_FOCUS' | 'TAB_SWITCH' | 'WINDOW_MINIMIZED';
//   violations: Violation[];
//   lastHeartbeat: string;
//   connectionQuality: number;
// }

// export interface Violation {
//   id: number;
//   sessionId: number;
//   type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'MULTIPLE_FACES' | 'NO_FACE' | 'VOICE_DETECTED' | 'PHONE_DETECTED' | 'UNAUTHORIZED_APPLICATION';
//   severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
//   timestamp: string;
//   description: string;
//   screenshot?: string;
//   resolved: boolean;
//   autoResolved: boolean;
// }

// export interface ProctorAlert {
//   id: number;
//   sessionId: number;
//   studentName: string;
//   violationType: string;
//   severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
//   timestamp: string;
//   description: string;
//   status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED';
//   screenshot?: string;
//   autoFlagged: boolean;
// }

// export interface ProctorReport {
//   id: number;
//   testId: number;
//   testTitle: string;
//   totalSessions: number;
//   completedSessions: number;
//   totalViolations: number;
//   criticalViolations: number;
//   averageSessionDuration: number;
//   startDate: string;
//   endDate: string;
//   suspiciousActivityRate: number;
// }

// export interface SessionFilters {
//   status?: string;
//   testId?: number;
//   studentName?: string;
//   dateRange?: {
//     start: string;
//     end: string;
//   };
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ProctorService {
//   private apiUrl = 'http://localhost:8080/api/proctor';

//   constructor(private http: HttpClient) {}

//   // ==================== EXAM SESSIONS ====================
//   getActiveSessions(page: number = 0, size: number = 10): Observable<any> {
//     const params = new HttpParams()
//       .set('page', page.toString())
//       .set('size', size.toString())
//       .set('status', 'ACTIVE');
//     return this.http.get<any>(`${this.apiUrl}/sessions`, { params });
//   }

//   getAllSessions(page: number = 0, size: number = 10, filters?: SessionFilters): Observable<any> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('size', size.toString());

//     if (filters?.status) {
//       params = params.set('status', filters.status);
//     }
//     if (filters?.testId) {
//       params = params.set('testId', filters.testId.toString());
//     }
//     if (filters?.studentName) {
//       params = params.set('studentName', filters.studentName);
//     }
//     if (filters?.dateRange) {
//       params = params
//         .set('startDate', filters.dateRange.start)
//         .set('endDate', filters.dateRange.end);
//     }

//     return this.http.get<any>(`${this.apiUrl}/sessions`, { params });
//   }

//   getSessionDetails(sessionId: number): Observable<ExamSession> {
//     return this.http.get<ExamSession>(`${this.apiUrl}/sessions/${sessionId}`);
//   }

//   terminateSession(sessionId: number, reason: string): Observable<any> {
//     return this.http.post(`${this.apiUrl}/sessions/${sessionId}/terminate`, { reason });
//   }

//   pauseSession(sessionId: number): Observable<any> {
//     return this.http.post(`${this.apiUrl}/sessions/${sessionId}/pause`, {});
//   }

//   resumeSession(sessionId: number): Observable<any> {
//     return this.http.post(`${this.apiUrl}/sessions/${sessionId}/resume`, {});
//   }

//   sendWarning(sessionId: number, message: string): Observable<any> {
//     return this.http.post(`${this.apiUrl}/sessions/${sessionId}/warning`, { message });
//   }

//   // ==================== LIVE MONITORING ====================
//   getLiveMonitoringData(): Observable<LiveMonitoringData[]> {
//     return this.http.get<LiveMonitoringData[]>(`${this.apiUrl}/monitoring/live`);
//   }

//   getSessionMonitoringData(sessionId: number): Observable<LiveMonitoringData> {
//     return this.http.get<LiveMonitoringData>(`${this.apiUrl}/monitoring/sessions/${sessionId}`);
//   }

//   getSessionStream(sessionId: number): Observable<any> {
//     return this.http.get(`${this.apiUrl}/monitoring/sessions/${sessionId}/stream`);
//   }

//   // ==================== VIOLATIONS & ALERTS ====================
//   getActiveAlerts(page: number = 0, size: number = 10): Observable<any> {
//     const params = new HttpParams()
//       .set('page', page.toString())
//       .set('size', size.toString())
//       .set('status', 'NEW,IN_REVIEW');
//     return this.http.get<any>(`${this.apiUrl}/alerts`, { params });
//   }

//   getAllViolations(sessionId?: number, page: number = 0, size: number = 10): Observable<any> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('size', size.toString());

//     if (sessionId) {
//       params = params.set('sessionId', sessionId.toString());
//     }

//     return this.http.get<any>(`${this.apiUrl}/violations`, { params });
//   }

//   updateAlertStatus(alertId: number, status: string, notes?: string): Observable<any> {
//     return this.http.put(`${this.apiUrl}/alerts/${alertId}`, { status, notes });
//   }

//   resolveViolation(violationId: number, action: string, notes?: string): Observable<any> {
//     return this.http.put(`${this.apiUrl}/violations/${violationId}/resolve`, { action, notes });
//   }

//   // ==================== REPORTS ====================
//   getProctorReports(filters?: any): Observable<ProctorReport[]> {
//     return this.http.get<ProctorReport[]>(`${this.apiUrl}/reports`, { params: filters });
//   }

//   generateReport(testId: number, startDate: string, endDate: string): Observable<any> {
//     return this.http.post(`${this.apiUrl}/reports/generate`, { testId, startDate, endDate });
//   }

//   downloadReport(reportId: number): Observable<Blob> {
//     return this.http.get(`${this.apiUrl}/reports/${reportId}/download`, { 
//       responseType: 'blob' 
//     });
//   }
// }