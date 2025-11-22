// components/analytics-export-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

@Component({
  selector: 'app-analytics-export-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="export-button-container">
      <div class="btn-group">
        <button class="btn btn-success dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
                [disabled]="!analyticsData">
          <i class="bi bi-download me-1"></i> Export
        </button>
        <ul class="dropdown-menu">
          <li>
            <a class="dropdown-item" (click)="onExport('csv')">
              <i class="bi bi-file-earmark-spreadsheet me-2"></i>
              CSV Format
            </a>
          </li>
          <li>
            <a class="dropdown-item" (click)="onExport('excel')">
              <i class="bi bi-file-earmark-excel me-2"></i>
              Excel Format
            </a>
          </li>
          <li>
            <a class="dropdown-item" (click)="onExport('pdf')">
              <i class="bi bi-file-earmark-pdf me-2"></i>
              PDF Report
            </a>
          </li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./analytics-export-button.component.scss']
})
export class AnalyticsExportButtonComponent {
  @Input() testId!: number;
  @Input() analyticsData: any = null;
  @Input() filters: any = {};
  @Output() export = new EventEmitter<ExportFormat>();

  onExport(format: ExportFormat): void {
    this.export.emit(format);
  }
}