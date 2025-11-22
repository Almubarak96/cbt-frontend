import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionUpload } from './question-upload';

describe('QuestionUpload', () => {
  let component: QuestionUpload;
  let fixture: ComponentFixture<QuestionUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
