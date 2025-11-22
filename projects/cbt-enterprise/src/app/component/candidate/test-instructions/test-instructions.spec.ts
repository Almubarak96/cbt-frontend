import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestInstructions } from './test-instructions';

describe('TestInstructionsComponent', () => {
  let component: TestInstructions;
  let fixture: ComponentFixture<TestInstructions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestInstructions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestInstructions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
