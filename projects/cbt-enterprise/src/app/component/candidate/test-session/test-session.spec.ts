import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSession } from './test-session';

describe('TestSession', () => {
  let component: TestSession;
  let fixture: ComponentFixture<TestSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSession]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSession);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
