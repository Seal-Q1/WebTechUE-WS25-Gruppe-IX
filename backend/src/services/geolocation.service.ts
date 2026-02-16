import cfg from '../../config.json';
import {urlEncode} from "../utils/url-encoder";
import {AddressDto} from "@shared/types";


export interface Coordinates {
    latitude: number,
    longitude: number
}

interface NominatimAddress extends Record<string, string | undefined> {
    street: string;
    city: string;
    postalcode: string;
}

interface NominatimResponse {
    lat: string,
    lon: string
}

export class GeolocationService {
    readonly apiUrl = cfg.nominatim.apiUrl;
    readonly params = {
        format: 'jsonv2',
        limit: 1,
        countrycodes: 'AT'
    }

    async toCoordinates(address: AddressDto): Promise<Coordinates> {
        const nominatimAddress: NominatimAddress = {
            street: [address.street, address.houseNr, address.door ?? ""].join(" "),
            postalcode: address.postalCode,
            city: address.city,
        }
        const response = await fetch(`${this.apiUrl}/search?` + urlEncode(this.params, nominatimAddress))
        const data: NominatimResponse[] = await response.json()
        const result = data[0]!
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
        };
    }
}