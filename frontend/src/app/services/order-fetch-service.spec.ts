import { TestBed } from '@angular/core/testing';

import { OrderFetchService } from './order-fetch-service';

describe('OrderFetchService', () => {
  let service: OrderFetchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderFetchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
