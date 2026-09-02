export interface PFZRegionPreset {
  id: string;
  name: string;
  harbor: string;
  centerLat: number;
  centerLng: number;
  defaultRadiusKm: number;
}

export const pfzRegionPresets: PFZRegionPreset[] = [
  {
    id: 'kochi',
    name: 'Kochi / SW Kerala Shelf Front',
    harbor: 'Kochi',
    centerLat: 9.9312,
    centerLng: 76.2673,
    defaultRadiusKm: 60
  },
  {
    id: 'vizhinjam',
    name: 'Vizhinjam / Wadge Bank Perimeter',
    harbor: 'Vizhinjam',
    centerLat: 8.3750,
    centerLng: 76.9900,
    defaultRadiusKm: 75
  },
  {
    id: 'mangalore',
    name: 'Mangalore / Karnataka Shelf Front',
    harbor: 'Mangalore',
    centerLat: 12.8700,
    centerLng: 74.8400,
    defaultRadiusKm: 50
  },
  {
    id: 'goa',
    name: 'Goa / Konkan Convergence',
    harbor: 'Goa',
    centerLat: 15.4900,
    centerLng: 73.8200,
    defaultRadiusKm: 55
  },
  {
    id: 'chennai',
    name: 'Chennai / Coromandel Plume',
    harbor: 'Chennai',
    centerLat: 13.0800,
    centerLng: 80.2700,
    defaultRadiusKm: 65
  }
];
