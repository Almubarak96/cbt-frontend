import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingIndicatorsComponent } from './recording-indicators.component';

describe('RecordingIndicatorsComponent', () => {
  let component: RecordingIndicatorsComponent;
  let fixture: ComponentFixture<RecordingIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordingIndicatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordingIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
