import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderElement } from './order-element';

describe('OrderElement', () => {
  let component: OrderElement;
  let fixture: ComponentFixture<OrderElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderElement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderElement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
