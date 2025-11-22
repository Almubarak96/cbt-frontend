import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualGradingComponent } from './manual-grading.component';

describe('ManualGradingComponent', () => {
  let component: ManualGradingComponent;
  let fixture: ComponentFixture<ManualGradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualGradingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualGradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
