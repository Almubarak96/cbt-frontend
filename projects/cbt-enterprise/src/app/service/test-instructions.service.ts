// services/test-instructions.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestInstructionsModel } from '../models/test-instructions.dto';

@Injectable({
  providedIn: 'root'
})
export class TestInstructionsService {
  private apiUrl = 'http://localhost:8080/api/exam/instructions';

  constructor(private http: HttpClient) { }

// Add these methods to your ExamService
updateInstructions(examId: number, instructions: any): Observable<any> {
  return this.http.put(`http://localhost:8080/api/exam/instructions/${examId}`, instructions);
}

saveInstructions(instructions: any): Observable<any> {
  return this.http.post('http://localhost:8080/api/exam/instructions', instructions);
}

getInstructions(examId: string): Observable<any> {
  return this.http.get(`http://localhost:8080/api/exam/instructions/${examId}`);
}



}