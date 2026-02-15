import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PaymentCardDto, UserAddressDto} from '@shared/types';

@Component({
  selector: 'app-payment-selection',
  imports: [],
  templateUrl: './payment-selection.component.html',
  styleUrl: './payment-selection.component.css',
})
export class PaymentSelection {
  @Input() card!: PaymentCardDto;
  @Output() selected = new EventEmitter<PaymentCardDto>();

  selectCard() {
    this.selected.emit(this.card);
  }
}
