import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPollList } from './order-poll-list';

describe('OrderPollList', () => {
  let component: OrderPollList;
  let fixture: ComponentFixture<OrderPollList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPollList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPollList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
