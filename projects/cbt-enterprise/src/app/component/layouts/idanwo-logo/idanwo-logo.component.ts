import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-idanwo-logo',
  standalone: true,
  template: `
    <div class="brand-logo-container" [class.collapsed]="collapsed">
      <img 
        *ngIf="!collapsed" 
        src="/images/idanwo-logo.svg" 
        alt="Ìdánwò"
        class="brand-logo"
        [style.width.px]="width"
        [style.height.px]="height"
      >
      <img 
        *ngIf="collapsed" 
        src="/images/idanwo-logo-collapsed.svg" 
        alt="Ìdánwò"
        class="brand-logo collapsed"
        [style.width.px]="collapsedWidth"
        [style.height.px]="collapsedHeight"
      >
    </div>
  `,
  styleUrls: ['./idanwo-logo.component.scss']
})
export class IdanwoLogoComponent {
  @Input() collapsed = false;
  @Input() width = 140;
  @Input() height = 35;
  @Input() collapsedWidth = 35;
  @Input() collapsedHeight = 35;
}