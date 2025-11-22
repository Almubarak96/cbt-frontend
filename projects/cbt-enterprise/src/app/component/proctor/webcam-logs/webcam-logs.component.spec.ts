import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamLogsComponent } from './webcam-logs.component';

describe('WebcamLogsComponent', () => {
  let component: WebcamLogsComponent;
  let fixture: ComponentFixture<WebcamLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebcamLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebcamLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
