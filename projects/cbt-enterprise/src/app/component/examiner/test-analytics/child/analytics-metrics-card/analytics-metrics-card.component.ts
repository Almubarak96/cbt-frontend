// components/analytics-metrics-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MetricColor = 'primary' | 'success' | 'warning' | 'info' | 'danger';

@Component({
  selector: 'app-analytics-metrics-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-card" [class]="'metrics-card--' + color">
      <div class="metrics-card__icon">
        <i class="bi" [class]="icon"></i>
      </div>
      <div class="metrics-card__content">
        <div class="metrics-card__value">
          {{ value | number:'1.0-1' }}{{ suffix }}
        </div>
        <div class="metrics-card__label">{{ label }}</div>
        <div *ngIf="trend !== undefined" class="metrics-card__trend" [class]="getTrendClass()">
          <i class="bi" [class]="getTrendIcon()"></i>
          {{ Math.abs(trend) }}%
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./analytics-metrics-card.component.scss']
})
export class AnalyticsMetricsCardComponent {
  @Input() icon!: string;
  @Input() value!: number;
  @Input() label!: string;
  @Input() suffix: string = '';
  @Input() trend?: number;
  @Input() color: MetricColor = 'primary';

  Math = Math;

  getTrendClass(): string {
    if (this.trend === undefined) return '';
    return this.trend >= 0 ? 'trend--positive' : 'trend--negative';
  }

  getTrendIcon(): string {
    if (this.trend === undefined) return '';
    return this.trend >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
  }
}