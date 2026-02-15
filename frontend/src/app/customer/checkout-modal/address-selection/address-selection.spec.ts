import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressSelection } from './address-selection';

describe('AddressSelection', () => {
  let component: AddressSelection;
  let fixture: ComponentFixture<AddressSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
