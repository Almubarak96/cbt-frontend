import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestResultsListComponent } from './test-results-list.component';

describe('TestResultsListComponent', () => {
  let component: TestResultsListComponent;
  let fixture: ComponentFixture<TestResultsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestResultsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestResultsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
