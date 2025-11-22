import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestInstructionsFormComponent } from './test-instructions-form';


describe('TestInstructionsFormComponent', () => {
  let component: TestInstructionsFormComponent;
  let fixture: ComponentFixture<TestInstructionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestInstructionsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestInstructionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
