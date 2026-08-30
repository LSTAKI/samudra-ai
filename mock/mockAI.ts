import { AIMessage } from '../types';

export const mockAIResponses: Record<string, Omit<AIMessage, 'id' | 'question'>> = {
  'why is sst elevated near kerala?': {
    analysis: 'SST in the selected coastal sector near Kerala (southwest coast of India) is approximately +0.81°C above the seasonal average. This localized warming is primarily attributed to a combination of weakened coastal upwelling along the Malabar Coast during this transition phase, reduced wind-stress curl, and high solar insolation. Ocean currents show a northward sluggish shelf flow, reducing horizontal mixing. The thermal footprint is confined within 150 km of the shore.',
    dataEvidence: [
      { sensor: 'ISRO INSAT-3DS', value: '29.42°C' },
      { sensor: 'NOAA AVHRR', value: '29.38°C' },
      { sensor: 'INCOIS OCM-3', value: '29.40°C' }
    ],
    consensus: {
      values: [
        { sensor: 'ISRO INSAT-3DS', value: '29.42°C' },
        { sensor: 'NOAA AVHRR', value: '29.38°C' },
        { sensor: 'INCOIS OCM-3', value: '29.40°C' }
      ],
      consensusValue: '29.40°C',
      difference: '0.04°C',
      confidence: 'HIGH'
    },
    confidence: 'HIGH',
    provenance: [
      {
        source: 'ISRO MOSDAC',
        dataset: 'INSAT-3DS SST (L2P Product)',
        coordinates: '9.9312° N, 76.2673° E',
        timestamp: '29 Aug 2026 08:00 UTC',
        processing: 'xarray NetCDF sea-surface atmospheric correction',
        validation: 'In-situ Argo Float Cal/Val',
        confidence: 'HIGH'
      },
      {
        source: 'NOAA STAR',
        dataset: 'AVHRR Pathfinder v5.3',
        coordinates: '9.9312° N, 76.2673° E',
        timestamp: '29 Aug 2026 07:30 UTC',
        processing: 'ACSPO physical retrieval model',
        validation: 'NOAA Buoy QA/QC database',
        confidence: 'HIGH'
      }
    ]
  },
  'compare wave conditions over the last 72 hours.': {
    analysis: 'Wave conditions in the Arabian Sea shelf area have experienced moderate attenuation over the last 72 hours. Peak wave height decreased from 1.85m to 1.42m, driven by a weakening southwest monsoon wind field (gusts dropped from 13.5 m/s to 8.5 m/s). Swell direction remains stable at 240° (WSW) with a peak wave period of 9.2 seconds. The sea state has transitioned from "moderate-rough" to "slight-moderate" according to the WMO Sea State code.',
    dataEvidence: [
      { sensor: 'INCOIS Wave Rider Buoy', value: '1.42m (Peak)' },
      { sensor: 'Copernicus Sentinel-6 Alt', value: '1.45m' },
      { sensor: 'NOAA Wavewatch III', value: '1.38m' }
    ],
    consensus: {
      values: [
        { sensor: 'INCOIS Buoy', value: '1.42m' },
        { sensor: 'Copernicus Alt', value: '1.45m' },
        { sensor: 'NOAA WW3', value: '1.38m' }
      ],
      consensusValue: '1.42m',
      difference: '0.07m',
      confidence: 'HIGH'
    },
    confidence: 'HIGH',
    provenance: [
      {
        source: 'INCOIS',
        dataset: 'Coastal Wave Rider Buoy Network (Kochi)',
        coordinates: '9.9312° N, 76.2673° E',
        timestamp: '29 Aug 2026 08:00 UTC',
        processing: 'Spectral analysis of accelerometers',
        validation: 'Double difference quality filter',
        confidence: 'HIGH'
      }
    ]
  },
  'where are the strongest chlorophyll fronts?': {
    analysis: 'Highly distinct chlorophyll fronts are observed along the shelf break boundary approximately 80-120 km offshore Kochi. The horizontal gradient reaches 0.12 mg/m³ per kilometer. This front corresponds to a nutrient convergence zone where shelf current shear meets deeper offshore Arabian Sea water. A secondary, weaker chlorophyll gradient is expanding in the northern Gulf of Mannar, likely supported by shallow wind-driven upwelling.',
    dataEvidence: [
      { sensor: 'ISRO OCM-3 (INSAT)', value: '0.64 mg/m³' },
      { sensor: 'Copernicus Sentinel-3 OLCI', value: '0.62 mg/m³' },
      { sensor: 'NOAA VIIRS', value: '0.65 mg/m³' }
    ],
    consensus: {
      values: [
        { sensor: 'ISRO OCM-3', value: '0.64 mg/m³' },
        { sensor: 'Copernicus OLCI', value: '0.62 mg/m³' },
        { sensor: 'NOAA VIIRS', value: '0.65 mg/m³' }
      ],
      consensusValue: '0.64 mg/m³',
      difference: '0.03 mg/m³',
      confidence: 'HIGH'
    },
    confidence: 'HIGH',
    provenance: [
      {
        source: 'ISRO MOSDAC',
        dataset: 'Oceansat-3 OCM Chlorophyll-a Product',
        coordinates: '9.9312° N, 76.2673° E',
        timestamp: '29 Aug 2026 04:30 UTC',
        processing: 'OC4 algorithm with atmospheric corrections',
        validation: 'INCOIS Sagar Kanya research cruise match-ups',
        confidence: 'HIGH'
      }
    ]
  },
  'compare isro and noaa observations.': {
    analysis: 'Comparison of thermal sensors shows high correlation between ISRO INSAT-3DS and NOAA AVHRR over the Southeastern Arabian Sea. The spatial bias is negligible (+0.04°C). The INSAT-3DS geostationary sensor provides superior temporal resolution (15-min intervals) but suffers from coastal cloud masking. The polar-orbiting NOAA AVHRR offers higher spatial clarity (1 km) at the cost of a twice-daily observation window. Calibration datasets match within expected margins.',
    dataEvidence: [
      { sensor: 'ISRO INSAT-3DS SST', value: '29.42°C' },
      { sensor: 'NOAA AVHRR SST', value: '29.38°C' },
      { sensor: 'Sensor Bias Delta', value: '+0.04°C' }
    ],
    consensus: {
      values: [
        { sensor: 'ISRO INSAT-3DS', value: '29.42°C' },
        { sensor: 'NOAA AVHRR', value: '29.38°C' }
      ],
      consensusValue: '29.40°C',
      difference: '0.04°C',
      confidence: 'HIGH'
    },
    confidence: 'HIGH',
    provenance: [
      {
        source: 'ISRO / NOAA Joint Calibration',
        dataset: 'SST Cross-Calibration NetCDF',
        coordinates: 'Regional Basin Scope',
        timestamp: '29 Aug 2026 08:00 UTC',
        processing: 'Collocation and regression matching',
        validation: 'Argo profiling floats',
        confidence: 'HIGH'
      }
    ]
  },
  'is there a marine heatwave?': {
    analysis: 'Yes, a Category 1 (Moderate) Marine Heatwave (MHW) is detected in the Southeastern Arabian Sea. SST anomaly maps show an index exceeding the 90th percentile threshold relative to the 30-year climatological baseline for 7 consecutive days. The anomaly spans approximately 42,000 square kilometers, centered around the Lakshadweep-Kerala basin. Immediate ecological impacts include localized stress indicators on reef structures in the Lakshadweep archipelago.',
    dataEvidence: [
      { sensor: 'ISRO Climatology Index', value: '91st percentile' },
      { sensor: 'Copernicus OSTIA Anomaly', value: '+0.81°C' },
      { sensor: 'MHW Duration', value: '7 days' }
    ],
    consensus: {
      values: [
        { sensor: 'Copernicus OSTIA', value: '+0.81°C Anomaly' },
        { sensor: 'INCOIS ROMS model', value: '+0.78°C Anomaly' }
      ],
      consensusValue: '+0.80°C Anomaly',
      difference: '0.03°C',
      confidence: 'HIGH'
    },
    confidence: 'HIGH',
    provenance: [
      {
        source: 'INCOIS Marine Advisory',
        dataset: 'Marine Heatwave Monitoring Alert',
        coordinates: '9.5000° N, 75.0000° E',
        timestamp: '29 Aug 2026 06:00 UTC',
        processing: 'Daily anomaly threshold check against OISST v2.1',
        validation: 'Satellite data match with autonomous buoys',
        confidence: 'HIGH'
      }
    ]
  }
};

export const getAIResponse = (query: string): AIMessage => {
  const cleanQuery = query.trim().toLowerCase();
  
  // Find match or return a generic reasoning block
  const match = mockAIResponses[cleanQuery] || mockAIResponses[Object.keys(mockAIResponses)[0]];
  
  return {
    id: `ai-msg-${Math.random().toString(36).substr(2, 9)}`,
    question: query,
    ...match
  };
};
