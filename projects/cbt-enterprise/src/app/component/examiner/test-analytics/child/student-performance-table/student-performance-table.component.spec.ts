import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPerformanceTableComponent } from './student-performance-table.component';

describe('StudentPerformanceTableComponent', () => {
  let component: StudentPerformanceTableComponent;
  let fixture: ComponentFixture<StudentPerformanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPerformanceTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentPerformanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
