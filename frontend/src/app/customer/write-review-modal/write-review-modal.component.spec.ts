import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteReviewModal } from './write-review-modal.component';

describe('ReviewModal', () => {
  let component: WriteReviewModal;
  let fixture: ComponentFixture<WriteReviewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteReviewModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteReviewModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
