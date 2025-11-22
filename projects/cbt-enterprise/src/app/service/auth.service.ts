import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenStorageService } from './token.storage.service';
import { environment } from '../../environments/environment.development';
//import { environment } from '../../environments/environment';

interface LoginRequest {
  username: string;
  password: string;
}
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.API_BASE;
  private currentRole$ = new BehaviorSubject<string | null>(null);
  private currentUser$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private store: TokenStorageService) {
    this.hydrateFromAccessToken();
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}api/auth/login`, req).pipe(
      tap(res => {
        this.store.accessToken = res.accessToken;
        this.store.refreshToken = res.refreshToken;
        this.hydrateFromAccessToken();
      })
    );
  }

  register(payload: FormData): Observable<any> {
    return this.http.post(`${this.base}api/auth/register`, payload);
  }


  refresh() {
    const refreshToken = this.store.refreshToken;
    if (!refreshToken) throw new Error('No refresh token');
    return this.http.post<LoginResponse>(`${this.base}/auth/refresh`, { refreshToken }).pipe(
      tap(res => {
        this.store.accessToken = res.accessToken;
        this.store.refreshToken = res.refreshToken;
        this.hydrateFromAccessToken();
      })
    );
  }

  logout() {
    const refreshToken = this.store.refreshToken;
    this.store.clear();
    if (!refreshToken) return new Observable<void>(obs => obs.complete());
    return this.http.post<void>(`${this.base}/auth/logout`, { refreshToken });
  }

  getRole$() {
    return this.currentRole$.asObservable();
  }
  getUser$() {
    return this.currentUser$.asObservable();
  }

  private hydrateFromAccessToken() {
    const token = this.store.accessToken;
    if (!token) {
      this.currentRole$.next(null);
      this.currentUser$.next(null);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser$.next(payload.sub);
      this.currentRole$.next(payload.role);
    } catch {
      this.currentRole$.next(null);
      this.currentUser$.next(null);
    }
  }


  /*   forgotPassword(email: string): Observable<any> {
      return this.http.post(`${this.base}/forgot-password`, { email });
    }
  
    resetPassword(token: string, newPassword: string): Observable<any> {
      return this.http.post(`${this.base}/reset-password`, { token, newPassword });
    }
   */


  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.base}api/auth/forgot-password`, { email });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.base}api/auth/validate-reset-token?token=${token}`);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.base}api/auth/reset-password`, {
      token,
      newPassword
    });
  }


  getAccessToken(): string | null {
    return this.store.accessToken;
  }

}
