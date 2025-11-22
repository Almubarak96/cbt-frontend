import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = '/api/config'; // adjust if backend is hosted differently

  constructor(private http: HttpClient) {}

  // Get all configurations
  getConfigs(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Save configurations
  saveConfigs(configs: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, configs).pipe(
      catchError(this.handleError)
    );
  }

  // Error handler
  private handleError(error: any) {
    console.error('ConfigService Error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}
