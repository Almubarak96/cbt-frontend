import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EssayViewerComponent } from './essay-viewer.component';

describe('EssayViewerComponent', () => {
  let component: EssayViewerComponent;
  let fixture: ComponentFixture<EssayViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EssayViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EssayViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
