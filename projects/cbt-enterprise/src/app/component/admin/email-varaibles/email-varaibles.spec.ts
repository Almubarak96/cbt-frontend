import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailVaraibles } from './email-varaibles';

describe('EmailVaraiblesComponent', () => {
  let component: EmailVaraibles;
  let fixture: ComponentFixture<EmailVaraibles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailVaraibles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailVaraibles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
