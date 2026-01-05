import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileList } from './profile-list';

describe('ProfileList', () => {
  let component: ProfileList;
  let fixture: ComponentFixture<ProfileList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
