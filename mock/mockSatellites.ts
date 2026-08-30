import { SatellitePlatform, SatelliteObservation } from '@/types/satellite';

export const mockSatellitePlatforms: SatellitePlatform[] = [
  {
    id: 'oceansat-3',
    name: 'Oceansat-3 (EOS-06)',
    agency: 'ISRO',
    orbitType: 'SUN_SYNCHRONOUS_LEO',
    altitudeKm: 720,
    inclinationDeg: 98.28,
    mission: 'Indian Oceanographic Observation Mission (Ocean Colour, Chlorophyll-a, Sea State, Wind Vectors)',
    status: 'DEMO',
    feedType: 'MOCK FEED',
    sensors: [
      {
        id: 'ocm-3',
        name: 'OCM-3 (Ocean Colour Monitor)',
        category: 'OCEAN_COLOUR',
        description: '13-Band Spectroradiometer for Phytoplankton, Chlorophyll-a, and Turbidity quantification',
        spectralBands: '400 - 1010 nm (13 VNIR Bands)',
        spatialResolution: '360 m GSD',
        verified: true
      },
      {
        id: 'scat-3',
        name: 'Ku-band Scatterometer',
        category: 'MICROWAVE',
        description: 'Rotating pencil-beam radar scatterometer for ocean surface wind vectors',
        spectralBands: '13.515 GHz (Ku-band)',
        spatialResolution: '25 km / 50 km Grid',
        verified: true
      },
      {
        id: 'sstm',
        name: 'SSTM (Sea Surface Temp Monitor)',
        category: 'VISIBLE_INFRARED',
        description: 'Dual-channel Thermal Infrared radiometer for sea surface temperature derivation',
        spectralBands: '10.5 - 12.5 µm (TIR-1 & TIR-2)',
        spatialResolution: '1080 m',
        verified: true
      }
    ],
    verifiedProducts: ['Chlorophyll-a', 'Ocean Surface Wind', 'Suspended Sediment', 'SST']
  },
  {
    id: 'insat-3ds',
    name: 'INSAT-3DS',
    agency: 'ISRO',
    orbitType: 'GEOSTATIONARY',
    altitudeKm: 35786,
    inclinationDeg: 0,
    mission: 'Geostationary Meteorological & Oceanographic Satellite (Continuous Indian Ocean Monitoring)',
    status: 'DEMO',
    feedType: 'MOCK FEED',
    sensors: [
      {
        id: 'insat-imager',
        name: '6-Channel Multispectral Imager',
        category: 'VISIBLE_INFRARED',
        description: 'High-frequency disk imaging sensor providing thermal infrared and water vapor fields',
        spectralBands: 'VIS (0.55-0.75µm), SWIR, MIR, WV, TIR-1, TIR-2',
        spatialResolution: '1 km (VIS) to 4 km (TIR)',
        verified: true
      },
      {
        id: 'insat-sounder',
        name: '19-Channel Atmospheric Sounder',
        category: 'METEOROLOGICAL',
        description: 'Infrared sounding sensor for vertical profiles of temperature and humidity',
        spectralBands: '18 IR bands + 1 VIS band',
        spatialResolution: '10 km',
        verified: true
      }
    ],
    verifiedProducts: ['Sea Surface Temperature', 'Outgoing Longwave Radiation', 'Atmospheric Motion Vectors']
  },
  {
    id: 'sentinel-3a',
    name: 'Sentinel-3A',
    agency: 'ESA / EUMETSAT',
    orbitType: 'SUN_SYNCHRONOUS_LEO',
    altitudeKm: 814.5,
    inclinationDeg: 98.65,
    mission: 'Copernicus Marine and Land Environment Monitoring Mission (Ocean Topography, SST, Ocean Colour)',
    status: 'DEMO',
    feedType: 'MOCK FEED',
    sensors: [
      {
        id: 'slstr',
        name: 'SLSTR (Sea & Land Surface Temperature)',
        category: 'VISIBLE_INFRARED',
        description: 'Dual-view conical scanning radiometer for reference sea surface temperatures',
        spectralBands: '9 Bands (VIS, SWIR, MWIR, TIR)',
        spatialResolution: '500 m (VIS/SWIR) / 1 km (TIR)',
        verified: true
      },
      {
        id: 'olci',
        name: 'OLCI (Ocean & Land Colour Instrument)',
        category: 'OCEAN_COLOUR',
        description: '21-Band imaging spectrometer based on ENVISAT MERIS legacy',
        spectralBands: '400 - 1020 nm (21 Bands)',
        spatialResolution: '300 m Full Resolution',
        verified: true
      },
      {
        id: 'sral',
        name: 'SRAL (SAR Radar Altimeter)',
        category: 'ALTIMETRY',
        description: 'Dual-frequency SAR altimeter for sea surface height and significant wave height',
        spectralBands: 'Ku-band (13.575 GHz) & C-band (5.41 GHz)',
        spatialResolution: '300 m along-track SAR',
        verified: true
      }
    ],
    verifiedProducts: ['SST L2P/L3', 'Ocean Colour Chlorophyll', 'Sea Surface Height (SLA)', 'Significant Wave Height']
  },
  {
    id: 'noaa-20',
    name: 'NOAA-20 (JPSS-1)',
    agency: 'NOAA / NASA',
    orbitType: 'POLAR_LEO',
    altitudeKm: 824,
    inclinationDeg: 98.7,
    mission: 'Joint Polar Satellite System Operational Environmental Monitoring',
    status: 'DEMO',
    feedType: 'MOCK FEED',
    sensors: [
      {
        id: 'viirs',
        name: 'VIIRS (Visible Infrared Radiometer)',
        category: 'VISIBLE_INFRARED',
        description: '22-Channel scanning radiometer for global SST, ocean color, and day/night marine monitoring',
        spectralBands: '0.412 - 12.01 µm (Imagery & Moderate Bands)',
        spatialResolution: '375 m (I-Bands) / 750 m (M-Bands)',
        verified: true
      },
      {
        id: 'atms',
        name: 'ATMS (Microwave Sounder)',
        category: 'MICROWAVE',
        description: 'Cross-track scanning microwave radiometer for precipitation and surface properties',
        spectralBands: '22 channels (23.8 to 183.3 GHz)',
        spatialResolution: '15 - 75 km',
        verified: true
      }
    ],
    verifiedProducts: ['Global SST ACSPO', 'Ocean Colour Radiance', 'Day/Night Band Boat Detection']
  }
];

export const mockSatelliteObservations: SatelliteObservation[] = [
  {
    id: 'obs-oc3-01',
    platformId: 'oceansat-3',
    platformName: 'Oceansat-3 (EOS-06)',
    sensorId: 'ocm-3',
    sensorName: 'OCM-3 (Ocean Colour Monitor)',
    sensorCategory: 'OCEAN_COLOUR',
    productId: 'chl',
    productName: 'Chlorophyll-a Concentration',
    productCategory: 'CHLOROPHYLL',
    timestamp: '2026-08-29T04:20:00Z',
    timeOfDay: '04:20 UTC',
    latitude: 9.9312,
    longitude: 76.2673,
    resolution: '360 m GSD',
    orbitPass: 'Pass #412 (Descending)',
    cloudCoverage: '8.4%',
    status: 'DEMO',
    source: 'ISRO MOSDAC Receiver (Demo Swath)',
    relatedCopernicusLayer: 'copernicus-chl',
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [74.5, 11.5],
          [77.8, 11.0],
          [77.2, 8.5],
          [73.9, 9.0],
          [74.5, 11.5]
        ]
      ]
    },
    groundTrackGeoJson: {
      type: 'LineString',
      coordinates: [
        [75.8, 13.0],
        [76.0, 10.5],
        [76.3, 8.0],
        [76.5, 5.5]
      ]
    }
  },
  {
    id: 'obs-s3a-02',
    platformId: 'sentinel-3a',
    platformName: 'Sentinel-3A',
    sensorId: 'slstr',
    sensorName: 'SLSTR (Radiometer)',
    sensorCategory: 'VISIBLE_INFRARED',
    productId: 'sst',
    productName: 'Sea Surface Temperature L2P',
    productCategory: 'SST',
    timestamp: '2026-08-29T05:45:00Z',
    timeOfDay: '05:45 UTC',
    latitude: 14.5000,
    longitude: 68.0000,
    resolution: '1 km Dual-View',
    orbitPass: 'Pass #128 (Descending)',
    cloudCoverage: '4.1%',
    status: 'DEMO',
    source: 'Copernicus Sentinel Ground Segment (Demo)',
    relatedCopernicusLayer: 'copernicus-sst',
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [65.5, 16.5],
          [70.5, 16.0],
          [69.5, 12.5],
          [64.5, 13.0],
          [65.5, 16.5]
        ]
      ]
    },
    groundTrackGeoJson: {
      type: 'LineString',
      coordinates: [
        [67.2, 18.0],
        [67.8, 15.0],
        [68.3, 12.0],
        [68.8, 9.0]
      ]
    }
  },
  {
    id: 'obs-insat-03',
    platformId: 'insat-3ds',
    platformName: 'INSAT-3DS',
    sensorId: 'insat-imager',
    sensorName: '6-Channel Imager',
    sensorCategory: 'VISIBLE_INFRARED',
    productId: 'sst',
    productName: 'Geostationary Sea Surface Temp',
    productCategory: 'SST',
    timestamp: '2026-08-29T06:00:00Z',
    timeOfDay: '06:00 UTC',
    latitude: 12.0000,
    longitude: 78.5000,
    resolution: '4 km Thermal IR',
    orbitPass: 'Full Disk Slot #24',
    cloudCoverage: '14.2%',
    status: 'DEMO',
    source: 'ISRO MOSDAC Geostationary Feed (Demo)',
    relatedCopernicusLayer: 'copernicus-sst',
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [65.0, 22.0],
          [88.0, 22.0],
          [86.0, 4.0],
          [66.0, 4.0],
          [65.0, 22.0]
        ]
      ]
    }
  },
  {
    id: 'obs-noaa-04',
    platformId: 'noaa-20',
    platformName: 'NOAA-20 (JPSS-1)',
    sensorId: 'viirs',
    sensorName: 'VIIRS Radiometer',
    sensorCategory: 'VISIBLE_INFRARED',
    productId: 'sst',
    productName: 'VIIRS L3U High-Resolution SST',
    productCategory: 'SST',
    timestamp: '2026-08-29T08:15:00Z',
    timeOfDay: '08:15 UTC',
    latitude: 13.5000,
    longitude: 85.0000,
    resolution: '750 m Moderate',
    orbitPass: 'Pass #549 (Ascending)',
    cloudCoverage: '11.0%',
    status: 'DEMO',
    source: 'NOAA CoastWatch / OceanWatch (Demo)',
    relatedCopernicusLayer: 'copernicus-sst',
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [82.0, 16.0],
          [87.5, 15.5],
          [86.5, 11.0],
          [81.0, 11.5],
          [82.0, 16.0]
        ]
      ]
    },
    groundTrackGeoJson: {
      type: 'LineString',
      coordinates: [
        [83.8, 17.5],
        [84.4, 14.5],
        [85.0, 11.5],
        [85.6, 8.5]
      ]
    }
  },
  {
    id: 'obs-s3a-05',
    platformId: 'sentinel-3a',
    platformName: 'Sentinel-3A',
    sensorId: 'sral',
    sensorName: 'SRAL (SAR Altimeter)',
    sensorCategory: 'ALTIMETRY',
    productId: 'sea_level',
    productName: 'Sea Level Anomaly & SWH Track',
    productCategory: 'SEA_LEVEL',
    timestamp: '2026-08-29T11:30:00Z',
    timeOfDay: '11:30 UTC',
    latitude: 7.5000,
    longitude: 79.5000,
    resolution: '300 m along-track SAR',
    orbitPass: 'Track #254 (Ascending)',
    cloudCoverage: 'N/A (Radar Altimeter)',
    status: 'DEMO',
    source: 'Copernicus Marine Altimetry (Demo)',
    relatedCopernicusLayer: 'copernicus-sla',
    groundTrackGeoJson: {
      type: 'LineString',
      coordinates: [
        [78.0, 12.0],
        [78.8, 9.5],
        [79.5, 7.0],
        [80.2, 4.5]
      ]
    },
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [77.7, 12.0],
          [78.3, 12.0],
          [80.5, 4.5],
          [79.9, 4.5],
          [77.7, 12.0]
        ]
      ]
    }
  },
  {
    id: 'obs-oc3-06',
    platformId: 'oceansat-3',
    platformName: 'Oceansat-3 (EOS-06)',
    sensorId: 'scat-3',
    sensorName: 'Ku-band Scatterometer',
    sensorCategory: 'MICROWAVE',
    productId: 'wind_waves',
    productName: 'Ocean Surface Wind Vectors',
    productCategory: 'WIND_WAVES',
    timestamp: '2026-08-29T14:10:00Z',
    timeOfDay: '14:10 UTC',
    latitude: 9.0000,
    longitude: 79.2000,
    resolution: '25 km Wind Vector Cell',
    orbitPass: 'Pass #418 (Ascending)',
    cloudCoverage: 'N/A (All-Weather Ku-band)',
    status: 'DEMO',
    source: 'ISRO MOSDAC Scatterometer Feed (Demo)',
    relatedCopernicusLayer: 'copernicus-wave',
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [76.8, 12.0],
          [81.5, 11.5],
          [80.5, 6.5],
          [75.8, 7.0],
          [76.8, 12.0]
        ]
      ]
    }
  },
  {
    id: 'obs-insat-07',
    platformId: 'insat-3ds',
    platformName: 'INSAT-3DS',
    sensorId: 'insat-imager',
    sensorName: '6-Channel Imager (Night)',
    sensorCategory: 'VISIBLE_INFRARED',
    productId: 'sst',
    productName: 'Nighttime Thermal Sea Surface Temp',
    productCategory: 'SST',
    timestamp: '2026-08-29T18:00:00Z',
    timeOfDay: '18:00 UTC',
    latitude: 11.5000,
    longitude: 72.0000,
    resolution: '4 km Thermal IR',
    orbitPass: 'Full Disk Slot #48',
    cloudCoverage: '9.8%',
    status: 'DEMO',
    source: 'ISRO MOSDAC Geostationary Feed (Demo)',
    relatedCopernicusLayer: 'copernicus-sst',
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [68.0, 16.0],
          [75.0, 15.5],
          [74.0, 8.0],
          [67.0, 8.5],
          [68.0, 16.0]
        ]
      ]
    }
  },
  {
    id: 'obs-noaa-08',
    platformId: 'noaa-20',
    platformName: 'NOAA-20 (JPSS-1)',
    sensorId: 'viirs',
    sensorName: 'VIIRS Day/Night Band',
    sensorCategory: 'VISIBLE_INFRARED',
    productId: 'sst',
    productName: 'VIIRS High-Resolution Night SST',
    productCategory: 'SST',
    timestamp: '2026-08-29T21:40:00Z',
    timeOfDay: '21:40 UTC',
    latitude: 9.9500,
    longitude: 75.5000,
    resolution: '750 m Moderate',
    orbitPass: 'Pass #558 (Descending)',
    cloudCoverage: '6.2%',
    status: 'DEMO',
    source: 'NOAA JPSS Direct Broadcast (Demo)',
    relatedCopernicusLayer: 'copernicus-sst',
    footprintGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [73.0, 13.0],
          [78.0, 12.5],
          [77.0, 7.5],
          [72.0, 8.0],
          [73.0, 13.0]
        ]
      ]
    },
    groundTrackGeoJson: {
      type: 'LineString',
      coordinates: [
        [74.8, 14.5],
        [75.4, 11.5],
        [76.0, 8.5],
        [76.6, 5.5]
      ]
    }
  }
];
