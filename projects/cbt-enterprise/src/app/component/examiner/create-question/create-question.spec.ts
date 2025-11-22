import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuestion } from './create-question';

describe('CreateQuestion', () => {
  let component: CreateQuestion;
  let fixture: ComponentFixture<CreateQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
