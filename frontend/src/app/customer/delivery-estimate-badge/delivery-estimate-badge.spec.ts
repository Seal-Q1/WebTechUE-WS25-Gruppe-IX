import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryEstimateBadge } from './delivery-estimate-badge';

describe('DeliveryEstimateBadge', () => {
  let component: DeliveryEstimateBadge;
  let fixture: ComponentFixture<DeliveryEstimateBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryEstimateBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryEstimateBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
