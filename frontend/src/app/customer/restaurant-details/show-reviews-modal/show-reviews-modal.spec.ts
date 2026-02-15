import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReviewsModal } from './show-reviews-modal';

describe('ShowReviewsModal', () => {
  let component: ShowReviewsModal;
  let fixture: ComponentFixture<ShowReviewsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReviewsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowReviewsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
