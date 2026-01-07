import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RestaurantForm} from './restaurant-form';

describe('RestaurantForm', () => {
  let component: RestaurantForm;
  let fixture: ComponentFixture<RestaurantForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RestaurantForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
