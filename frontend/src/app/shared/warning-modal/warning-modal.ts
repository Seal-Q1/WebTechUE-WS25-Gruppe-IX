import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-warning-modal',
  imports: [CommonModule],
  templateUrl: './warning-modal.html',
  styleUrl: './warning-modal.css',
})
export class WarningModal {
  @Input() isVisible = false;
  @Input() title = 'Warning';
  @Input() message = '';
  @Input() warningCount = 0;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}
