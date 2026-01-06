import {Component, Input} from '@angular/core';
import {AddressDto} from '../../../dtos/address.dto';

@Component({
  selector: 'app-address-card',
  imports: [],
  templateUrl: './address-card.html',
  styleUrl: './address-card.css',
})
export class AddressCard {
  @Input() address!: AddressDto | undefined;

}
