import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollCandidateComponent } from './enroll-candidate.component';

describe('EnrollCandidateComponent', () => {
  let component: EnrollCandidateComponent;
  let fixture: ComponentFixture<EnrollCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollCandidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
