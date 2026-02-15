import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UserAddressDto} from '@shared/types';

@Component({
  selector: 'app-address-selection',
  imports: [],
  templateUrl: './address-selection.html',
  styleUrl: './address-selection.css',
})
export class AddressSelection {
  @Input() address!: UserAddressDto;
  @Output() selected = new EventEmitter<UserAddressDto>();

  selectAddress() {
    this.selected.emit(this.address);
  }
}
