import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-essay-viewer',
  standalone: true,
  imports: [],
  templateUrl: './essay-viewer.component.html',
  styleUrl: './essay-viewer.component.scss'
})
export class EssayViewerComponent {


 @Input() content: string = '';

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.sanitizeAndDisplayContent();
    }
  }

  private sanitizeAndDisplayContent(): void {
    // Basic sanitization - you might want to use DomSanitizer for production
    const container = this.elementRef.nativeElement.querySelector('.ql-editor');
    if (container) {
      container.innerHTML = this.content || '<p>No content available</p>';
    }
  }


  getTextLength(htmlContent: string | undefined): number {
  if (!htmlContent) return 0;
  
  // Strip HTML tags to get actual text length
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  return tempDiv.textContent?.length || 0;
}


}
