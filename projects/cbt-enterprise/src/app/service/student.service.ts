// // student.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { StudentProfile } from '../models/student-profile.dto';

// @Injectable({
//   providedIn: 'root'
// })
// export class StudentService {
//   private apiUrl = 'http://localhost:8080/api/student';

//   constructor(private http: HttpClient) {}

//   getCurrentStudentProfile(): Observable<StudentProfile> {
//     return this.http.get<StudentProfile>(`${this.apiUrl}/profile`);
//   }

//   updateStudentProfile(profile: Partial<StudentProfile>): Observable<StudentProfile> {
//     return this.http.put<StudentProfile>(`${this.apiUrl}/profile`, profile);
//   }

//   uploadProfilePicture(file: File): Observable<{ url: string }> {
//     const formData = new FormData();
//     formData.append('file', file);
//     return this.http.post<{ url: string }>(`${this.apiUrl}/profile/picture`, formData);
//   }
// }