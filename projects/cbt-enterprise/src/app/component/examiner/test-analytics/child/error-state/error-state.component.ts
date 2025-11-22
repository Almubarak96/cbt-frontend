// shared/components/error-state.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-state">
      <div class="error-icon">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <div class="error-content">
        <h4>Something went wrong</h4>
        <p class="error-message">{{ message }}</p>
        <div class="error-actions" *ngIf="showRetry">
          <button class="btn btn-primary" (click)="retry.emit()">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Try Again
          </button>
          <button class="btn btn-outline-secondary" (click)="dismiss.emit()">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./error-state.component.scss']
})
export class ErrorStateComponent {
  @Input() message: string = 'An unexpected error occurred.';
  @Input() showRetry: boolean = true;
  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();
}