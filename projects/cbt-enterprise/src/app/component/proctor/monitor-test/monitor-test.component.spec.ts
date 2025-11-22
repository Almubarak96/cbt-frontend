import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorTestComponent } from './monitor-test.component';

describe('MonitorTestComponent', () => {
  let component: MonitorTestComponent;
  let fixture: ComponentFixture<MonitorTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
