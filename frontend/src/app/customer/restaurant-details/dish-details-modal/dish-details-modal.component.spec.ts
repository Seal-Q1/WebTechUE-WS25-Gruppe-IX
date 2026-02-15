import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishDetailsModal } from './dish-details-modal.component';

describe('DishDetails', () => {
  let component: DishDetailsModal;
  let fixture: ComponentFixture<DishDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishDetailsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
