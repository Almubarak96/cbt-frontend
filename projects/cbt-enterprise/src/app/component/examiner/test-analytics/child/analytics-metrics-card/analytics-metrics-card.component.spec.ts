import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsMetricsCardComponent } from './analytics-metrics-card.component';

describe('AnalyticsMetricsCardComponent', () => {
  let component: AnalyticsMetricsCardComponent;
  let fixture: ComponentFixture<AnalyticsMetricsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsMetricsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsMetricsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
