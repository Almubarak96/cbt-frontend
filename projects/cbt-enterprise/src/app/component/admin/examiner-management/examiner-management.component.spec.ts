import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminerManagementComponent } from './examiner-management.component';

describe('ExaminerManagementComponent', () => {
  let component: ExaminerManagementComponent;
  let fixture: ComponentFixture<ExaminerManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExaminerManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExaminerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
