import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProctoringReportsComponent } from './proctoring-reports.component';

describe('ProctoringReportsComponent', () => {
  let component: ProctoringReportsComponent;
  let fixture: ComponentFixture<ProctoringReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProctoringReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProctoringReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
