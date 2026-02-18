import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistanceBadge } from './distance-badge';

describe('DistanceBadge', () => {
  let component: DistanceBadge;
  let fixture: ComponentFixture<DistanceBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistanceBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistanceBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
