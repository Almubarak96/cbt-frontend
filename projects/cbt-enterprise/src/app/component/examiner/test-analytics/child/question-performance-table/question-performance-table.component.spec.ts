import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionPerformanceTableComponent } from './question-performance-table.component';

describe('QuestionPerformanceTableComponent', () => {
  let component: QuestionPerformanceTableComponent;
  let fixture: ComponentFixture<QuestionPerformanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionPerformanceTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionPerformanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
