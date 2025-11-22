import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTemplate } from './email-template';

describe('EmailTemplateComponent', () => {
  let component: EmailTemplate;
  let fixture: ComponentFixture<EmailTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTemplate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
