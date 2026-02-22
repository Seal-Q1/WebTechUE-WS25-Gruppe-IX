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

  private readonly earthRadiusKm: number = 6371;

  private readonly mealPrepEstimate: number = 25;
  private readonly deliverySpeedKmh: number = 30;

  private readonly userGPSLocation = toSignal(this.getCurrentGPSPosition().pipe(
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

  getUserLocation() {
    if(this.userGPSLocation()) {
      return this.userGPSLocation();
    }
    return this.getDefaultAddressPosition();
  }

  getDistanceFromMe(target: CoordinateDto): number | undefined {
    const userLocation = this.getUserLocation();
    if(userLocation) {
      return this.getDistance(target, userLocation);
    }
    return undefined;
  }

  getDeliveryEstimateFromMe(target: CoordinateDto): number | undefined {
    const userLocation = this.getUserLocation();
    if(userLocation) {
      return this.getDeliveryEstimate(target, userLocation);
    }
    return undefined;
  }

  getDeliveryEstimate(origin: CoordinateDto, target: CoordinateDto): number {
    const distance = this.getDistance(origin, target);
    return this.mealPrepEstimate + distance / this.deliverySpeedKmh * 60;
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
