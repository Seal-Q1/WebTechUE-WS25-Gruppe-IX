import {inject, Injectable} from '@angular/core';
import {CoordinateDto} from '@shared/types';
import {AuthService} from './auth.service';
import {catchError, Observable, of} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private authService = inject(AuthService);

  readonly earthRadiusKm: number = 6371;

  readonly userLocation = toSignal(this.getCurrentGPSPosition().pipe(
    catchError(() => of(undefined))
  ));

  private getCurrentGPSPosition() {
    return new Observable<CoordinateDto>(subscriber => {
      if(!navigator.geolocation) {
        subscriber.error('Geolocation is not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => {
          subscriber.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          subscriber.complete();
        },
        error => {
          subscriber.error(error);
        }
      );
    });
  }

  private getDefaultAddressPosition(): CoordinateDto | undefined {
    const userDto = this.authService.currentUserValue;
    if(userDto) {
      const address = userDto.addresses.find((address) => {
        return address.isDefault
      });
      return address?.address.coordinates;
    }
    return undefined;
  }

  getDistanceFromMe(target: CoordinateDto): number | undefined {
    const userLocation = this.userLocation();
    if(userLocation) {
      return this.getDistance(target, userLocation);
    }
    return this.getDistanceFromDefaultAddr(target);
  }

  getDistanceFromDefaultAddr(target: CoordinateDto): number | undefined {
    const defaultAddrPos = this.getDefaultAddressPosition()
    if(defaultAddrPos) {
      return this.getDistance(target, defaultAddrPos);
    }
    return undefined;
  }

  // Formula adapted from this StackOverflow post
  // https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
  // "Haversine" formula to calculate great-circle distance betwee two points
  // See https://www.movable-type.co.uk/scripts/latlong.html
  getDistance(point1: CoordinateDto, point2: CoordinateDto) {
    const diffLat = this.degToRad(point2.latitude - point1.latitude);
    const diffLon = this.degToRad(point2.longitude - point1.longitude);

    const lat1 = this.degToRad(point1.latitude);
    const lat2 = this.degToRad(point2.latitude);

    const a = Math.sin(diffLat/2) * Math.sin(diffLat/2)
      + Math.sin(diffLon/2) * Math.sin(diffLon/2)
      * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return this.earthRadiusKm * c;
  }

  private degToRad(degrees: number) {
    return degrees * Math.PI / 180;
  }
}
