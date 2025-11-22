import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsExportButtonComponent } from './analytics-export-button.component';

describe('AnalyticsExportButtonComponent', () => {
  let component: AnalyticsExportButtonComponent;
  let fixture: ComponentFixture<AnalyticsExportButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsExportButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsExportButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
