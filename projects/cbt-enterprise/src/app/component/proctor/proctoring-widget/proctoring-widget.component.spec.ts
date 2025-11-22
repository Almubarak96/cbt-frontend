import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProctoringWidgetComponent } from './proctoring-widget.component';

describe('ProctoringWidgetComponent', () => {
  let component: ProctoringWidgetComponent;
  let fixture: ComponentFixture<ProctoringWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProctoringWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProctoringWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
