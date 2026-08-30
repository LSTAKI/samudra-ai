import { PFZZone, PFZRegionPreset } from '@/types/pfz';
import { SafetyAlert } from '@/types';

export const pfzRegionPresets: PFZRegionPreset[] = [
  {
    id: 'arabian-sea',
    name: 'Arabian Sea Central Basin',
    basin: 'Arabian Sea',
    centerLat: 12.5000,
    centerLng: 71.0000,
    zoom: 5.5,
    defaultRadiusKm: 250
  },
  {
    id: 'kerala-coast',
    name: 'Kerala Coast & South Shelf',
    basin: 'Arabian Sea (Coastal Shelf)',
    centerLat: 9.8000,
    centerLng: 75.8000,
    zoom: 7.0,
    defaultRadiusKm: 100
  },
  {
    id: 'bay-of-bengal',
    name: 'Bay of Bengal Deep Basin',
    basin: 'Bay of Bengal',
    centerLat: 13.5000,
    centerLng: 85.0000,
    zoom: 5.5,
    defaultRadiusKm: 250
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu & Coromandel Coast',
    basin: 'Bay of Bengal (Coastal)',
    centerLat: 11.5000,
    centerLng: 80.5000,
    zoom: 7.0,
    defaultRadiusKm: 120
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep Archipelago Shelf',
    basin: 'Lakshadweep Sea',
    centerLat: 10.5000,
    centerLng: 73.0000,
    zoom: 7.2,
    defaultRadiusKm: 80
  },
  {
    id: 'sri-lanka',
    name: 'Gulf of Mannar & Sri Lanka Basin',
    basin: 'Indian Ocean',
    centerLat: 8.5000,
    centerLng: 79.5000,
    zoom: 6.8,
    defaultRadiusKm: 150
  }
];

export const mockPFZZones: PFZZone[] = [
  {
    id: 'ZONE-001',
    name: 'Kochi-South Shelf Front',
    sector: 'Kerala Coast (Sector K2)',
    latitude: 9.6000,
    longitude: 76.0000,
    score: 84,
    classification: 'HIGH',
    confidence: 'HIGH',
    primaryFactor: 'CHLOROPHYLL CONVERGENCE',
    status: 'DEMO',
    timestamp: '2026-08-29T00:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [75.6, 9.9],
          [76.3, 9.8],
          [76.2, 9.3],
          [75.5, 9.4],
          [75.6, 9.9]
        ]
      ]
    },
    metrics: {
      sst: 28.6,
      sstAnomaly: 0.45,
      chlorophyll: 0.58,
      waveHeight: 1.4,
      currentVelocity: 'UNAVAILABLE',
      depthMeters: 45
    },
    factors: [
      {
        name: 'SST Gradient',
        weight: 80,
        status: 'FAVORABLE',
        description: 'Thermal front detected: 0.65°C / 10 km gradient at shelf break',
        source: 'Copernicus OSTIA L4 NRT',
        isReal: true
      },
      {
        name: 'Chlorophyll-a Convergence',
        weight: 80,
        status: 'FAVORABLE',
        description: 'Phytoplankton accumulation plume exceeding 0.55 mg/m³',
        source: 'Copernicus BGC L4 NRT',
        isReal: true
      },
      {
        name: 'Wave Conditions',
        weight: 40,
        status: 'FAVORABLE',
        description: 'Moderate sea state (1.4 m Hm0) within safe operational thresholds',
        source: 'Copernicus WAV L4 NRT',
        isReal: true
      },
      {
        name: 'Ocean Currents',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Baroclinic divergence streamlines not connected (Phase 3)',
        source: 'Copernicus PHY_001_024',
        isReal: false
      },
      {
        name: 'Bathymetric Gradient',
        weight: 60,
        status: 'UNAVAILABLE',
        description: '200m isobath shelf contour integration pending GEBCO ingestion',
        source: 'Bathymetry Database',
        isReal: false
      }
    ]
  },
  {
    id: 'ZONE-002',
    name: 'Lakshadweep East Passage',
    sector: 'Lakshadweep Sea (Sector L4)',
    latitude: 10.3500,
    longitude: 73.3000,
    score: 76,
    classification: 'HIGH',
    confidence: 'HIGH',
    primaryFactor: 'THERMAL EDDY BOUNDARY',
    status: 'DEMO',
    timestamp: '2026-08-29T00:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.9, 10.6],
          [73.6, 10.5],
          [73.5, 10.1],
          [72.8, 10.2],
          [72.9, 10.6]
        ]
      ]
    },
    metrics: {
      sst: 28.9,
      sstAnomaly: 0.25,
      chlorophyll: 0.42,
      waveHeight: 1.6,
      currentVelocity: 'UNAVAILABLE',
      depthMeters: 120
    },
    factors: [
      {
        name: 'SST Gradient',
        weight: 80,
        status: 'FAVORABLE',
        description: 'Mesoscale cyclonic eddy periphery gradient of 0.45°C / 12 km',
        source: 'Copernicus OSTIA L4 NRT',
        isReal: true
      },
      {
        name: 'Chlorophyll-a Convergence',
        weight: 80,
        status: 'MODERATE',
        description: 'Plankton density 0.42 mg/m³ indicating moderate secondary production',
        source: 'Copernicus BGC L4 NRT',
        isReal: true
      },
      {
        name: 'Wave Conditions',
        weight: 40,
        status: 'FAVORABLE',
        description: 'Open ocean swell 1.6 m Hm0',
        source: 'Copernicus WAV L4 NRT',
        isReal: true
      },
      {
        name: 'Ocean Currents',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Vorticity shear values unavailable',
        source: 'Copernicus PHY_001_024',
        isReal: false
      },
      {
        name: 'Bathymetric Gradient',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Seamount slope contour pending 3D depth mesh',
        source: 'Bathymetry Database',
        isReal: false
      }
    ]
  },
  {
    id: 'ZONE-003',
    name: 'Vizhinjam Coastward Upwelling',
    sector: 'South Kerala Shelf (Sector V1)',
    latitude: 8.1500,
    longitude: 76.8000,
    score: 68,
    classification: 'MODERATE',
    confidence: 'MEDIUM',
    primaryFactor: 'COASTAL UPWELLING FRONT',
    status: 'DEMO',
    timestamp: '2026-08-29T00:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.5, 8.4],
          [77.1, 8.3],
          [77.0, 7.9],
          [76.4, 8.0],
          [76.5, 8.4]
        ]
      ]
    },
    metrics: {
      sst: 27.8,
      sstAnomaly: -0.65,
      chlorophyll: 0.65,
      waveHeight: 2.1,
      currentVelocity: 'UNAVAILABLE',
      depthMeters: 60
    },
    factors: [
      {
        name: 'SST Gradient',
        weight: 80,
        status: 'FAVORABLE',
        description: 'Cold coastal upwelling core (-0.65°C SST anomaly relative to basin mean)',
        source: 'Copernicus OSTIA L4 NRT',
        isReal: true
      },
      {
        name: 'Chlorophyll-a Convergence',
        weight: 80,
        status: 'FAVORABLE',
        description: 'Elevated nutrient bloom (0.65 mg/m³)',
        source: 'Copernicus BGC L4 NRT',
        isReal: true
      },
      {
        name: 'Wave Conditions',
        weight: 40,
        status: 'MODERATE',
        description: 'Elevated sea state (2.1 m Hm0) near southern tip shelf',
        source: 'Copernicus WAV L4 NRT',
        isReal: true
      },
      {
        name: 'Ocean Currents',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'West India Coastal Current (WICC) shear model pending',
        source: 'Copernicus PHY_001_024',
        isReal: false
      },
      {
        name: 'Bathymetric Gradient',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Continental slope isobaths unavailable',
        source: 'Bathymetry Database',
        isReal: false
      }
    ]
  },
  {
    id: 'ZONE-004',
    name: 'Gulf of Mannar Pelagic Ridge',
    sector: 'Sri Lanka Basin (Sector M3)',
    latitude: 8.8500,
    longitude: 79.1500,
    score: 62,
    classification: 'MODERATE',
    confidence: 'MEDIUM',
    primaryFactor: 'CHLOROPHYLL JET',
    status: 'DEMO',
    timestamp: '2026-08-29T00:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [78.8, 9.1],
          [79.5, 9.0],
          [79.4, 8.6],
          [78.7, 8.7],
          [78.8, 9.1]
        ]
      ]
    },
    metrics: {
      sst: 29.2,
      sstAnomaly: 0.30,
      chlorophyll: 0.38,
      waveHeight: 1.3,
      currentVelocity: 'UNAVAILABLE',
      depthMeters: 30
    },
    factors: [
      {
        name: 'SST Gradient',
        weight: 80,
        status: 'MODERATE',
        description: 'Diffuse thermal boundary in shallow strait waters',
        source: 'Copernicus OSTIA L4 NRT',
        isReal: true
      },
      {
        name: 'Chlorophyll-a Convergence',
        weight: 80,
        status: 'MODERATE',
        description: 'Moderate chlorophyll gradient (0.38 mg/m³)',
        source: 'Copernicus BGC L4 NRT',
        isReal: true
      },
      {
        name: 'Wave Conditions',
        weight: 40,
        status: 'FAVORABLE',
        description: 'Sheltered shallow water sea state (1.3 m Hm0)',
        source: 'Copernicus WAV L4 NRT',
        isReal: true
      },
      {
        name: 'Ocean Currents',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Tidal current velocities in Palk Strait not connected',
        source: 'Copernicus PHY_001_024',
        isReal: false
      },
      {
        name: 'Bathymetric Gradient',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Shallow sandbank contours unavailable',
        source: 'Bathymetry Database',
        isReal: false
      }
    ]
  },
  {
    id: 'ZONE-005',
    name: 'Central Arabian Gyre Boundary',
    sector: 'Deep Basin (Sector A1)',
    latitude: 14.2000,
    longitude: 67.8000,
    score: 46,
    classification: 'LOW',
    confidence: 'LOW',
    primaryFactor: 'DIFFUSE THERMAL BOUNDARY',
    status: 'DEMO',
    timestamp: '2026-08-29T00:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [67.0, 14.6],
          [68.6, 14.5],
          [68.4, 13.8],
          [66.8, 13.9],
          [67.0, 14.6]
        ]
      ]
    },
    metrics: {
      sst: 28.2,
      sstAnomaly: -0.10,
      chlorophyll: 0.18,
      waveHeight: 2.4,
      currentVelocity: 'UNAVAILABLE',
      depthMeters: 3200
    },
    factors: [
      {
        name: 'SST Gradient',
        weight: 80,
        status: 'MODERATE',
        description: 'Weak offshore thermal frontal boundary',
        source: 'Copernicus OSTIA L4 NRT',
        isReal: true
      },
      {
        name: 'Chlorophyll-a Convergence',
        weight: 80,
        status: 'UNFAVORABLE',
        description: 'Oligotrophic open ocean waters (< 0.20 mg/m³)',
        source: 'Copernicus BGC L4 NRT',
        isReal: true
      },
      {
        name: 'Wave Conditions',
        weight: 40,
        status: 'MODERATE',
        description: 'Open ocean swell exceeding 2.4 m Hm0',
        source: 'Copernicus WAV L4 NRT',
        isReal: true
      },
      {
        name: 'Ocean Currents',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Deep gyre recirculation vectors unavailable',
        source: 'Copernicus PHY_001_024',
        isReal: false
      },
      {
        name: 'Bathymetric Gradient',
        weight: 60,
        status: 'UNAVAILABLE',
        description: 'Abyssal plain depth > 3000m',
        source: 'Bathymetry Database',
        isReal: false
      }
    ]
  }
];

export const mockSafetyAlerts: SafetyAlert[] = [
  {
    id: 'alert-001',
    title: 'IMBL WARNING BUFFER TRESPASS',
    message: 'Trawler ORCA-MARLIN-7 approaching the Indian-Sri Lankan International Maritime Boundary Line warning zone.',
    distance: '3.2 km',
    risk: 'HIGH',
    coordinates: [9.1250, 79.5210],
    timestamp: '29 Aug 2026 08:35 UTC'
  },
  {
    id: 'alert-002',
    title: 'RESTRICTED NAVIGATIONAL ZONE',
    message: 'Unidentified commercial cargo vessel violating speed limit protocols near Lakshadweep Marine Protected Area.',
    distance: '5.8 km',
    risk: 'MEDIUM',
    coordinates: [10.5820, 72.6450],
    timestamp: '29 Aug 2026 08:12 UTC'
  },
  {
    id: 'alert-003',
    title: 'CYCLONE ANOMALY ALERT',
    message: 'Active wind field acceleration detected 280km West of Kochi coast. Sustained wind speed exceeding 24 m/s.',
    distance: '280 km',
    risk: 'HIGH',
    coordinates: [9.9000, 73.5000],
    timestamp: '29 Aug 2026 08:40 UTC'
  }
];

export const mockIMBLBoundary = [
  [9.0, 79.2],
  [9.3, 79.6],
  [9.5, 79.8],
  [9.8, 80.0]
];

export const mockIMBLWarningBuffer = [
  [8.9, 79.1],
  [9.2, 79.5],
  [9.4, 79.7],
  [9.7, 79.9]
];

// Preserved for MapComponent backwards compatibility
export const mockEEZBoundary = [
  [5.0, 70.0],
  [12.0, 68.0],
  [15.0, 72.0],
  [13.0, 77.0],
  [7.0, 78.0],
  [6.0, 77.0],
  [5.0, 70.0]
];

export const mockPFZSectors = [
  {
    sector: 'Kochi-South Shelf (Sector K2)',
    sstFront: 'Gradient: 0.65°C / 10 km (Strong)',
    chlorophyllFront: 'Gradient: 0.18 mg/m³ / 5 km (Very Strong)',
    estimatedProductivity: '1240 mg C/m²/day (High Pelagic Density)',
    source: 'ISRO OCM-3 + INSAT-3DS Fusion',
    confidence: 'HIGH' as const,
    polygon: [
      [9.5, 75.8],
      [9.8, 75.9],
      [9.7, 76.2],
      [9.4, 76.1],
      [9.5, 75.8]
    ] as [number, number][]
  },
  {
    sector: 'Lakshadweep East Passage (Sector L4)',
    sstFront: 'Gradient: 0.42°C / 15 km (Moderate)',
    chlorophyllFront: 'Gradient: 0.08 mg/m³ / 10 km (Moderate)',
    estimatedProductivity: '780 mg C/m²/day (Medium Pelagic Density)',
    source: 'NOAA AVHRR + INCOIS OCM',
    confidence: 'HIGH' as const,
    polygon: [
      [10.2, 73.1],
      [10.6, 73.2],
      [10.5, 73.5],
      [10.1, 73.4],
      [10.2, 73.1]
    ] as [number, number][]
  },
  {
    sector: 'Vizhinjam Coastward (Sector V1)',
    sstFront: 'Gradient: 0.72°C / 8 km (Very Strong)',
    chlorophyllFront: 'Gradient: 0.14 mg/m³ / 7 km (Strong)',
    estimatedProductivity: '1100 mg C/m²/day (High Pelagic Density)',
    source: 'ISRO INSAT-3DS + INCOIS Buoy Network',
    confidence: 'MEDIUM' as const,
    polygon: [
      [8.1, 76.6],
      [8.3, 76.8],
      [8.2, 77.0],
      [8.0, 76.8],
      [8.1, 76.6]
    ] as [number, number][]
  }
];

