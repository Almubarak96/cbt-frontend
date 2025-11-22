import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAnalyticsComponent } from './test-analytics.component';

describe('TestAnalyticsComponent', () => {
  let component: TestAnalyticsComponent;
  let fixture: ComponentFixture<TestAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
