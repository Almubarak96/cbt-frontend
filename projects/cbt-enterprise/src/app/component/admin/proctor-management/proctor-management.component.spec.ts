import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProctorManagementComponent } from './proctor-management.component';

describe('ProctorManagementComponent', () => {
  let component: ProctorManagementComponent;
  let fixture: ComponentFixture<ProctorManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProctorManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProctorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
