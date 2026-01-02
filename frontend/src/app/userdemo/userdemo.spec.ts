import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userdemo } from './userdemo';

describe('Userdemo', () => {
  let component: Userdemo;
  let fixture: ComponentFixture<Userdemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userdemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userdemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
