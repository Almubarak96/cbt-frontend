import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/admin/notifications';

  constructor(private http: HttpClient) {}

  previewEmail(payload: any): Observable<string> {
    return this.http.post(`${this.baseUrl}/preview`, payload, { responseType: 'text' });
  }

  sendEmail(payload: any): Observable<string> {
    return this.http.post(`${this.baseUrl}/send`, payload, { responseType: 'text' });
  }

  downloadPdf(name: string, variables: any = {}): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/download/pdf/${name}`, variables, {
      responseType: 'blob'
    });
  }
}
