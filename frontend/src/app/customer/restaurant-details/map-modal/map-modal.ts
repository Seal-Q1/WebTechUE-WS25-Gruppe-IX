import {Component, inject, input} from '@angular/core';
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import * as Leaflet from 'leaflet';
import {CoordinateDto, MenuItemWithImageDto} from '@shared/types';
import {DIALOG_DATA} from '@angular/cdk/dialog';
import {icon, Icon, latLng, marker, tileLayer} from 'leaflet';

@Component({
  selector: 'app-map-modal',
  imports: [
    LeafletModule,
  ],
  templateUrl: './map-modal.html',
  styleUrl: './map-modal.css',
})
export class MapModal {
  coordinate = inject<CoordinateDto>(DIALOG_DATA);

  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap Contributors' }),
      marker([ this.coordinate.latitude, this.coordinate.longitude ]),
    ],
    zoom: 14,
    center: latLng(this.coordinate.latitude, this.coordinate.longitude),
  };
}
