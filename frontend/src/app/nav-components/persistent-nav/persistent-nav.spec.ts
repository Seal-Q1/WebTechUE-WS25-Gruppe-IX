import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersistentNav } from './persistent-nav';

describe('PersistentNav', () => {
  let component: PersistentNav;
  let fixture: ComponentFixture<PersistentNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersistentNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersistentNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
