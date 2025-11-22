import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private baseUrl = 'http://localhost:8080/api/admin/templates';

  constructor(private http: HttpClient) {}

  getRaw(name: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/${name}`, { responseType: 'text' });
  }

  upsert(template: any): Observable<string> {
    return this.http.post(this.baseUrl, template, { responseType: 'text' });
  }

  delete(name: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${name}`, { responseType: 'text' });
  }
}
