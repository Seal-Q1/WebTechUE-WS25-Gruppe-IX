import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishElement } from './dish-element';

describe('DishElement', () => {
  let component: DishElement;
  let fixture: ComponentFixture<DishElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishElement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishElement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
