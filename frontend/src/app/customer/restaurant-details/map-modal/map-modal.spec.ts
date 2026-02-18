import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapModal } from './map-modal';

describe('MapModal', () => {
  let component: MapModal;
  let fixture: ComponentFixture<MapModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
