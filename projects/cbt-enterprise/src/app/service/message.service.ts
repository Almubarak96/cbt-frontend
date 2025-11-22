import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ToastMessage {
  severity: 'success' | 'error' | 'warn' | 'info';
  summary: string;
  detail: string;
  life?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new Subject<ToastMessage>();

  constructor() {}

  /**
   * Get messages as observable
   */
  get messages(): Observable<ToastMessage> {
    return this.messageSubject.asObservable();
  }

  /**
   * Show success message
   */
  success(summary: string, detail: string = ''): void {
    this.messageSubject.next({
      severity: 'success',
      summary,
      detail,
      life: 5000
    });
  }

  /**
   * Show error message
   */
  error(summary: string, detail: string = ''): void {
    this.messageSubject.next({
      severity: 'error',
      summary,
      detail,
      life: 7000
    });
  }

  /**
   * Show warning message
   */
  warn(summary: string, detail: string = ''): void {
    this.messageSubject.next({
      severity: 'warn',
      summary,
      detail,
      life: 6000
    });
  }

  /**
   * Show info message
   */
  info(summary: string, detail: string = ''): void {
    this.messageSubject.next({
      severity: 'info',
      summary,
      detail,
      life: 5000
    });
  }

  /**
   * Show custom message
   */
  show(message: ToastMessage): void {
    this.messageSubject.next(message);
  }
}