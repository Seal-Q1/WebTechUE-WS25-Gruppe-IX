import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantGrid } from './restaurant-grid.component';

describe('RestaurantOverview', () => {
  let component: RestaurantGrid;
  let fixture: ComponentFixture<RestaurantGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
