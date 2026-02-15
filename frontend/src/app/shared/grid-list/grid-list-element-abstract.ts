import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-grid-list-element-abstract',
  imports: [CommonModule],
  templateUrl: './grid-list-element-abstract.html',
  styleUrls: ['./grid-list-element-base.css', './grid-list-element-abstract.css'],
})
export class GridListElementAbstract {
  @Input() displayName: string = '';
  @Output() itemClick = new EventEmitter<void>();

  onItemClicked(): void {
    this.itemClick.emit();
  }
}
