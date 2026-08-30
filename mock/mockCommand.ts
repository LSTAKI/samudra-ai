import { OperationalEvent, DemoVessel, SystemServiceStatus } from '@/types/command';

export const mockOperationalEvents: OperationalEvent[] = [
  {
    id: 'EVENT-001',
    category: 'BOUNDARY',
    severity: 'HIGH',
    status: 'DEMO',
    workflowStatus: 'NEW',
    title: 'IMBL WARNING BUFFER APPROACH',
    description: 'Commercial trawler ORCA-MARLIN-7 detected 3.2 km west of the India-Sri Lanka International Maritime Boundary Line warning buffer in Palk Bay.',
    latitude: 9.1250,
    longitude: 79.5210,
    locationName: 'Palk Strait / Gulf of Mannar',
    timestamp: '29 Aug 2026 09:42 UTC',
    source: 'DEMO MARITIME SAFETY FEED',
    product: 'Vessel Geospatial Geofence',
    dataStatus: 'DEMO',
    metadata: {
      vesselName: 'ORCA-MARLIN-7',
      vesselCallsign: 'IND-TN-04-118',
      distanceKm: 3.2
    }
  },
  {
    id: 'EVENT-002',
    category: 'PFZ',
    severity: 'MEDIUM',
    status: 'DEMO',
    workflowStatus: 'NEW',
    title: 'PELAGIC PFZ CANDIDATE IDENTIFIED',
    description: 'High-suitability thermal & chlorophyll front convergence detected along Kochi shelf break (Sector K2). Plankton accumulation index 0.58 mg/m³.',
    latitude: 9.6000,
    longitude: 76.0000,
    locationName: 'Kerala Coast Shelf (Sector K2)',
    timestamp: '29 Aug 2026 08:42 UTC',
    source: 'ORCA PFZ HEURISTIC ENGINE',
    product: 'Copernicus BGC + OSTIA Fusion',
    dataset: 'ZONE-001',
    variable: 'pelagic_productivity_index',
    dataStatus: 'DEMO',
    metadata: {
      pfzZoneId: 'ZONE-001'
    }
  },
  {
    id: 'EVENT-003',
    category: 'ENVIRONMENTAL',
    severity: 'HIGH',
    status: 'DEMO',
    workflowStatus: 'INVESTIGATING',
    title: 'HIGH WAVE HAZARD ADVISORY',
    description: 'Significant wave height (Hm0) exceeding 2.2m detected near Vizhinjam & southern continental shelf. Heavy swell propagation from south-southwest.',
    latitude: 8.1500,
    longitude: 76.8000,
    locationName: 'South Kerala Shelf (Vizhinjam)',
    timestamp: '29 Aug 2026 07:15 UTC',
    source: 'COPERNICUS MARINE',
    product: 'GLOBAL_ANALYSISFORECAST_WAV_001_027',
    dataset: 'WAV L4 NRT',
    variable: 'VHM0',
    dataStatus: 'REAL DATA',
    metadata: {
      anomalyMetric: 'Wave Height: 2.1m (Hm0)'
    }
  },
  {
    id: 'EVENT-004',
    category: 'ENVIRONMENTAL',
    severity: 'MEDIUM',
    status: 'DEMO',
    workflowStatus: 'NEW',
    title: 'CYCLONIC THERMAL ANOMALY FRONT',
    description: 'Cold-core mesoscale eddy anomaly (-0.65°C departure from climatological baseline) observed in open Arabian Sea basin.',
    latitude: 14.2000,
    longitude: 67.8000,
    locationName: 'Central Arabian Sea Basin',
    timestamp: '29 Aug 2026 06:30 UTC',
    source: 'COPERNICUS MARINE',
    product: 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001',
    dataset: 'OSTIA L4 NRT',
    variable: 'analysed_sst',
    dataStatus: 'REAL DATA',
    metadata: {
      anomalyMetric: 'SST Anomaly: -0.65°C'
    }
  },
  {
    id: 'EVENT-005',
    category: 'SATELLITE',
    severity: 'INFO',
    status: 'DEMO',
    workflowStatus: 'RESOLVED',
    title: 'SENTINEL-3A SLSTR OVERPASS ACQUIRED',
    description: 'High-resolution dual-view radiometric SST observation (Pass #128) successfully received and ingested via ground segment.',
    latitude: 14.5000,
    longitude: 68.0000,
    locationName: 'Arabian Sea Swath Track',
    timestamp: '29 Aug 2026 05:45 UTC',
    source: 'COPERNICUS SENTINEL GROUND SEGMENT',
    product: 'SLSTR L2P Radiometer',
    dataStatus: 'DEMO',
    metadata: {
      platformId: 'sentinel-3a'
    }
  },
  {
    id: 'EVENT-006',
    category: 'MARITIME SAFETY',
    severity: 'MEDIUM',
    status: 'DEMO',
    workflowStatus: 'ACKNOWLEDGED',
    title: 'RESTRICTED NAVIGATIONAL ZONE BUFFER',
    description: 'Cargo vessel speed alert detected in proximity to Lakshadweep Archipelago marine reserve boundary.',
    latitude: 10.5820,
    longitude: 72.6450,
    locationName: 'Lakshadweep Archipelago',
    timestamp: '29 Aug 2026 08:12 UTC',
    source: 'DEMO MARITIME SAFETY FEED',
    product: 'AIS Navigation Zone Validator',
    dataStatus: 'DEMO',
    metadata: {
      distanceKm: 5.8
    }
  },
  {
    id: 'EVENT-007',
    category: 'SYSTEM',
    severity: 'INFO',
    status: 'DEMO',
    workflowStatus: 'RESOLVED',
    title: 'COPERNICUS OGC WMTS SYNC OK',
    description: 'Copernicus Marine daily gap-free OSTIA SST and BGC Chlorophyll raster tiles verified healthy with sub-second response times.',
    latitude: 10.0000,
    longitude: 75.0000,
    locationName: 'ORCA Data Ingestion Gateway',
    timestamp: '29 Aug 2026 00:00 UTC',
    source: 'ORCA SYSTEM ENGINE',
    product: 'WMTS Layer Broker',
    dataStatus: 'REAL DATA'
  }
];

export const mockDemoVessels: DemoVessel[] = [
  {
    id: 'VESSEL-01',
    name: 'ORCA-MARLIN-7',
    callsign: 'IND-TN-04-118',
    flag: 'India',
    type: 'Commercial Pelagic Trawler',
    latitude: 9.1400,
    longitude: 79.4800,
    heading: 115,
    speedKnots: 7.4,
    status: 'DEMO',
    track: [
      [79.2000, 9.0800],
      [79.3200, 9.1000],
      [79.4200, 9.1300],
      [79.4800, 9.1400]
    ]
  },
  {
    id: 'VESSEL-02',
    name: 'ORV SAGAR KANYA',
    callsign: 'VTKG',
    flag: 'India (MoES / NIO)',
    type: 'Oceanographic Research Vessel',
    latitude: 10.2500,
    longitude: 73.1000,
    heading: 260,
    speedKnots: 11.2,
    status: 'DEMO',
    track: [
      [73.5000, 10.3200],
      [73.3500, 10.2800],
      [73.2200, 10.2600],
      [73.1000, 10.2500]
    ]
  },
  {
    id: 'VESSEL-03',
    name: 'RV SAMUDRA RATNAKAR',
    callsign: 'VWTF',
    flag: 'India (GSI)',
    type: 'Geological Research Vessel',
    latitude: 13.4000,
    longitude: 84.8000,
    heading: 45,
    speedKnots: 9.5,
    status: 'DEMO',
    track: [
      [84.4000, 13.1500],
      [84.5500, 13.2500],
      [84.7000, 13.3500],
      [84.8000, 13.4000]
    ]
  }
];

export const mockSystemServices: SystemServiceStatus[] = [
  {
    serviceId: 'copernicus',
    name: 'COPERNICUS MARINE OGC WMTS',
    status: 'CONNECTED',
    latencyMs: 142,
    description: 'SST, Chlorophyll-a, Waves, and SLA global rasters connected'
  },
  {
    serviceId: 'isro',
    name: 'ISRO MOSDAC SATELLITE GATEWAY',
    status: 'DEMO',
    latencyMs: 380,
    description: 'INSAT-3DS & Oceansat-3 telemetry pipeline (Phase 3 ingestion)'
  },
  {
    serviceId: 'incois',
    name: 'INCOIS OCEAN OBSERVATION SYSTEM',
    status: 'DEMO',
    latencyMs: 290,
    description: 'RAMA moored buoy & wave rider telemetry feeds (Phase 3)'
  },
  {
    serviceId: 'noaa',
    name: 'NOAA COASTWATCH DIRECT BROADCAST',
    status: 'DEMO',
    latencyMs: 410,
    description: 'VIIRS & WaveWatch III international feeds (Phase 3)'
  },
  {
    serviceId: 'pfz',
    name: 'ORCA PFZ DECISION ENGINE',
    status: 'DEMO',
    latencyMs: 65,
    description: 'Heuristic pelagic convergence front detection model'
  },
  {
    serviceId: 'vessel',
    name: 'LIVE MARITIME AIS VESSEL FEED',
    status: 'UNAVAILABLE',
    description: 'Coastal radar & satellite AIS transponder ingest disconnected'
  },
  {
    serviceId: 'safety',
    name: 'MARITIME SAFETY ALERT DISPATCH',
    status: 'DEMO',
    latencyMs: 50,
    description: 'Simulated operational safety alert generator'
  }
];
