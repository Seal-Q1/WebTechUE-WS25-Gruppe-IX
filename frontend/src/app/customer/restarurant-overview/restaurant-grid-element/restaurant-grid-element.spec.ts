import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantGridElement } from './restaurant-grid-element';

describe('RestaurantGridElement', () => {
  let component: RestaurantGridElement;
  let fixture: ComponentFixture<RestaurantGridElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantGridElement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantGridElement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
