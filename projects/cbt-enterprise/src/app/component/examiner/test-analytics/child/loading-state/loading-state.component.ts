// shared/components/loading-state.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="loading-content">
        <h4>{{ message || 'Loading...' }}</h4>
        <p class="text-muted" *ngIf="subMessage">{{ subMessage }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./loading-state.component.scss']
})
export class LoadingStateComponent {
  @Input() message: string = 'Loading...';
  @Input() subMessage: string = '';
}