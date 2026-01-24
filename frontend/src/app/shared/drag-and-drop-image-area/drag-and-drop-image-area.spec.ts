import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragAndDropImageArea } from './drag-and-drop-image-area';

describe('DragAndDropImageArea', () => {
  let component: DragAndDropImageArea;
  let fixture: ComponentFixture<DragAndDropImageArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragAndDropImageArea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragAndDropImageArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
