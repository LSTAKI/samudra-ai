import { create } from 'zustand';
import {
  OceanParameter,
  OceanObservation,
  AIMessage,
  TimelineState,
  OceanMapLayer,
  LayerStatus,
  TimelineFrameType
} from '../types';
import { getClosestObservation } from '../mock/mockOcean';
import { defaultOceanLayers } from '../lib/map/layerManager';

/**
 * Computes canonical timestamp and semantic frame type for the timeline.
 * Copernicus Marine NRT products provide verified observations up to the latest operational date.
 * Future frames (+24h, +48h) are strictly marked UNAVAILABLE for observation layers to prevent misleading forecast implications.
 */
export const computeTimelineFrame = (
  index: number,
  mode: 'daily' | 'monthly' | 'annual',
  baseTimeStr: string = '2026-08-28T00:00:00Z'
): { timestamp: string; frameType: TimelineFrameType } => {
  // Ticks: ['-72h', '-48h', '-24h', 'NOW', '+24h', '+48h']
  const offsets = [-3, -2, -1, 0, 1, 2];
  const offsetDays = offsets[index] !== undefined ? offsets[index] : 0;

  if (offsetDays > 0) {
    return {
      timestamp: baseTimeStr,
      frameType: 'UNAVAILABLE'
    };
  }

  const baseDate = new Date(baseTimeStr);
  const targetDate = new Date(baseDate.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return {
    timestamp: targetDate.toISOString().replace(/\.\d+Z$/, 'Z'),
    frameType: 'OBSERVATION'
  };
};

interface OrcaState {
  // Canonical Map & Coordinate State
  selectedLatitude: number | null;
  selectedLongitude: number | null;
  selectedCoordinates: { lat: number; lng: number } | null;
  selectedMapData: OceanObservation | null;

  // Map Layers Architecture
  activeMapLayers: Record<string, boolean>;
  oceanLayers: OceanMapLayer[];
  selectedParameter: OceanParameter;
  copernicusSstOpacity: number;
  copernicusTileStatus: LayerStatus;
  layerOpacities: Record<string, number>;
  layerStatuses: Record<string, LayerStatus>;
  
  // Canonical Timeline State
  timelineMode: 'daily' | 'monthly' | 'annual';
  timelineIndex: number;
  selectedTimestamp: string;
  timelineFrameType: TimelineFrameType;
  isPlaying: boolean;
  fallbackTime: string;
  latestAvailableTime: string;
  
  // AI Assistant State
  aiMessages: AIMessage[];
  currentAIQuery: string;
  
  // UI Panels State
  sidebarOpen: boolean;
  assistantOpen: boolean;
  statusDrawerOpen: boolean;

  // Ocean Explorer 3D & Depth State
  selectedDepth: number; // in meters (0 = Surface)
  viewMode: '2d' | '3d';

  // Satellite Observatory State
  selectedPlatformId: string | null;
  selectedSensorCategory: string;
  selectedProductFilter: string;
  selectedObservationId: string | null;
  satelliteLayerVisibility: { tracks: boolean; footprints: boolean; points: boolean };

  // PFZ Analyzer State
  selectedPFZZoneId: string | null;
  selectedPFZRegion: string;
  pfzActiveRaster: 'none' | 'sst' | 'chlorophyll';
  pfzModelWeights: { sst: number; chlorophyll: number; current: number; waveHeight: number; bathymetry: number };
  pfzThresholds: { sstMin: number; sstMax: number; chlMin: number; chlMax: number; waveMax: number };

  // Analytics State
  analyticsRegion: string;
  analyticsPeriod: '7d' | '30d' | '90d' | 'custom';
  analyticsPrimaryParam: 'sst' | 'chlorophyll' | 'waveHeight' | 'seaLevel';
  analyticsActiveSources: string[];

  // Command Center State
  selectedOperationalEventId: string | null;
  commandSeverityFilter: 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  commandCategoryFilter: string;
  commandTimeWindow: '1H' | '6H' | '12H' | '24H' | '7D';
  commandLayerVisibility: { events: boolean; vessels: boolean; pfz: boolean; boundaries: boolean; hazards: boolean };
  eventWorkflowStatuses: Record<string, 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED'>;

  // Actions
  setSelectedDepth: (depth: number) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  setSelectedPlatformId: (id: string | null) => void;
  setSelectedSensorCategory: (cat: string) => void;
  setSelectedProductFilter: (prod: string) => void;
  setSelectedObservationId: (id: string | null) => void;
  setSatelliteLayerVisibility: (key: 'tracks' | 'footprints' | 'points', visible: boolean) => void;
  setSelectedPFZZoneId: (id: string | null) => void;
  setSelectedPFZRegion: (region: string) => void;
  setPFZActiveRaster: (raster: 'none' | 'sst' | 'chlorophyll') => void;
  setPFZModelWeights: (weights: Partial<{ sst: number; chlorophyll: number; current: number; waveHeight: number; bathymetry: number }>) => void;
  setPFZThresholds: (thresholds: Partial<{ sstMin: number; sstMax: number; chlMin: number; chlMax: number; waveMax: number }>) => void;
  setAnalyticsRegion: (region: string) => void;
  setAnalyticsPeriod: (period: '7d' | '30d' | '90d' | 'custom') => void;
  setAnalyticsPrimaryParam: (param: 'sst' | 'chlorophyll' | 'waveHeight' | 'seaLevel') => void;
  setAnalyticsActiveSources: (sources: string[]) => void;
  setSelectedOperationalEventId: (id: string | null) => void;
  setCommandSeverityFilter: (sev: 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO') => void;
  setCommandCategoryFilter: (cat: string) => void;
  setCommandTimeWindow: (win: '1H' | '6H' | '12H' | '24H' | '7D') => void;
  setCommandLayerVisibility: (key: 'events' | 'vessels' | 'pfz' | 'boundaries' | 'hazards', visible: boolean) => void;
  setEventWorkflowStatus: (eventId: string, status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED') => void;
  toggleLayer: (layerId: string) => void;
  setLayerState: (layerId: string, active: boolean) => void;
  updateLayerOpacity: (layerId: string, opacity: number) => void;
  updateLayerVisibility: (layerId: string, visible: boolean) => void;
  setLayerStatus: (layerId: string, status: LayerStatus) => void;
  selectParameter: (param: OceanParameter) => void;
  setSelectedCoordinates: (coords: { lat: number; lng: number } | null) => void;
  setTimelineMode: (mode: 'daily' | 'monthly' | 'annual') => void;
  setTimelineIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setLatestAvailableTime: (time: string) => void;
  setAIQuery: (query: string) => void;
  addAIMessage: (message: AIMessage) => void;
  clearMessages: () => void;
  toggleSidebar: () => void;
  toggleAssistant: () => void;
  toggleStatusDrawer: () => void;
  setSidebarOpen: (open: boolean) => void;
  setAssistantOpen: (open: boolean) => void;
  setStatusDrawerOpen: (open: boolean) => void;
  setCopernicusSstOpacity: (opacity: number) => void;
  setCopernicusTileStatus: (status: LayerStatus) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
}

const initialLayers: Record<string, boolean> = {
  // Ocean parameters
  'sst': true,
  'sstAnomaly': false,
  'waveHeight': false,
  'swell': false,
  'currents': false,
  'wind': false,
  'seaLevel': false,
  'salinity': false,
  'chlorophyll': false,
  'heatwave': false,
  'cyclone': false,
  // Boundaries
  'eez': true,
  'imbl': true,
  'imblBuffer': true,
  'mpa': false,
  'bathymetry': false,
  'restricted': false,
  // Data Sources
  'mosdac': true,
  'incois': true,
  'noaa': true,
  'copernicus': true
};

const defaultBaseTime = '2026-08-28T00:00:00Z';
const initialTimeline = computeTimelineFrame(3, 'daily', defaultBaseTime);

const initialOpacities: Record<string, number> = {
  'copernicus-sst': 0.70,
  'copernicus-wave': 0.70,
  'copernicus-sla': 0.70,
  'copernicus-chl': 0.70,
  'copernicus-currents': 0.70
};

const initialStatuses: Record<string, LayerStatus> = {
  'copernicus-sst': 'CONNECTED',
  'copernicus-wave': 'CONNECTED',
  'copernicus-sla': 'CONNECTED',
  'copernicus-chl': 'CONNECTED',
  'copernicus-currents': 'UNAVAILABLE'
};

export const useOrcaStore = create<OrcaState>((set, get) => ({
  // Canonical Map & Coordinate State (Default: Kerala Coast)
  selectedLatitude: 9.9312,
  selectedLongitude: 76.2673,
  selectedCoordinates: { lat: 9.9312, lng: 76.2673 },
  selectedMapData: getClosestObservation(9.9312, 76.2673).observation,

  // Map Layers Architecture
  activeMapLayers: initialLayers,
  oceanLayers: defaultOceanLayers,
  selectedParameter: 'sst',
  copernicusSstOpacity: 0.70,
  copernicusTileStatus: 'CONNECTED',
  layerOpacities: initialOpacities,
  layerStatuses: initialStatuses,
  
  // Canonical Timeline State
  timelineMode: 'daily',
  timelineIndex: 3, // "NOW"
  selectedTimestamp: initialTimeline.timestamp,
  timelineFrameType: initialTimeline.frameType,
  isPlaying: false,
  fallbackTime: defaultBaseTime,
  latestAvailableTime: defaultBaseTime,
  
  // AI Assistant State
  aiMessages: [],
  currentAIQuery: '',
  
  // UI Panels State
  sidebarOpen: true,
  assistantOpen: true,
  statusDrawerOpen: false,

  // Ocean Explorer 3D & Depth State
  selectedDepth: 0,
  viewMode: '2d',

  // Satellite Observatory State
  selectedPlatformId: 'oceansat-3',
  selectedSensorCategory: 'ALL',
  selectedProductFilter: 'ALL',
  selectedObservationId: 'obs-oc3-01',
  satelliteLayerVisibility: { tracks: true, footprints: true, points: true },

  // PFZ Analyzer State
  selectedPFZZoneId: 'ZONE-001',
  selectedPFZRegion: 'kerala-coast',
  pfzActiveRaster: 'chlorophyll',
  pfzModelWeights: { sst: 80, chlorophyll: 80, current: 60, waveHeight: 40, bathymetry: 60 },
  pfzThresholds: { sstMin: 26.0, sstMax: 30.5, chlMin: 0.25, chlMax: 2.5, waveMax: 2.5 },

  // Analytics State
  analyticsRegion: 'arabian-sea',
  analyticsPeriod: '30d',
  analyticsPrimaryParam: 'sst',
  analyticsActiveSources: ['copernicus', 'isro', 'incois', 'noaa'],

  // Command Center State
  selectedOperationalEventId: 'EVENT-001',
  commandSeverityFilter: 'ALL',
  commandCategoryFilter: 'ALL',
  commandTimeWindow: '24H',
  commandLayerVisibility: { events: true, vessels: true, pfz: true, boundaries: true, hazards: true },
  eventWorkflowStatuses: {
    'EVENT-001': 'NEW',
    'EVENT-002': 'NEW',
    'EVENT-003': 'INVESTIGATING',
    'EVENT-004': 'NEW',
    'EVENT-005': 'RESOLVED',
    'EVENT-006': 'ACKNOWLEDGED',
    'EVENT-007': 'RESOLVED'
  },

  // Actions
  setSelectedDepth: (depth) => set(() => ({ selectedDepth: depth })),
  setViewMode: (mode) => set(() => ({ viewMode: mode })),
  setSelectedPlatformId: (id) => set(() => ({ selectedPlatformId: id })),
  setSelectedSensorCategory: (cat) => set(() => ({ selectedSensorCategory: cat })),
  setSelectedProductFilter: (prod) => set(() => ({ selectedProductFilter: prod })),
  setSelectedObservationId: (id) => set(() => ({ selectedObservationId: id })),
  setSatelliteLayerVisibility: (key, visible) => set((state) => ({
    satelliteLayerVisibility: {
      ...state.satelliteLayerVisibility,
      [key]: visible
    }
  })),
  setSelectedPFZZoneId: (id) => set(() => ({ selectedPFZZoneId: id })),
  setSelectedPFZRegion: (region) => set(() => ({ selectedPFZRegion: region })),
  setPFZActiveRaster: (raster) => set(() => ({ pfzActiveRaster: raster })),
  setPFZModelWeights: (weights) => set((state) => ({
    pfzModelWeights: { ...state.pfzModelWeights, ...weights }
  })),
  setPFZThresholds: (thresholds) => set((state) => ({
    pfzThresholds: { ...state.pfzThresholds, ...thresholds }
  })),
  setAnalyticsRegion: (region) => set(() => ({ analyticsRegion: region })),
  setAnalyticsPeriod: (period) => set(() => ({ analyticsPeriod: period })),
  setAnalyticsPrimaryParam: (param) => set(() => ({ analyticsPrimaryParam: param })),
  setAnalyticsActiveSources: (sources) => set(() => ({ analyticsActiveSources: sources })),
  setSelectedOperationalEventId: (id) => set(() => ({ selectedOperationalEventId: id })),
  setCommandSeverityFilter: (sev) => set(() => ({ commandSeverityFilter: sev })),
  setCommandCategoryFilter: (cat) => set(() => ({ commandCategoryFilter: cat })),
  setCommandTimeWindow: (win) => set(() => ({ commandTimeWindow: win })),
  setCommandLayerVisibility: (key, visible) => set((state) => ({
    commandLayerVisibility: {
      ...state.commandLayerVisibility,
      [key]: visible
    }
  })),
  setEventWorkflowStatus: (eventId, status) => set((state) => ({
    eventWorkflowStatuses: {
      ...state.eventWorkflowStatuses,
      [eventId]: status
    }
  })),
  toggleLayer: (layerId) => set((state) => ({
    activeMapLayers: {
      ...state.activeMapLayers,
      [layerId]: !state.activeMapLayers[layerId]
    }
  })),
  
  setLayerState: (layerId, active) => set((state) => ({
    activeMapLayers: {
      ...state.activeMapLayers,
      [layerId]: active
    }
  })),

  updateLayerOpacity: (layerId, opacity) => set((state) => ({
    layerOpacities: {
      ...state.layerOpacities,
      [layerId]: opacity
    },
    oceanLayers: state.oceanLayers.map((l) =>
      l.id === layerId ? { ...l, opacity } : l
    ),
    ...(layerId === 'copernicus-sst' ? { copernicusSstOpacity: opacity } : {})
  })),

  setLayerOpacity: (layerId, opacity) => set((state) => ({
    layerOpacities: {
      ...state.layerOpacities,
      [layerId]: opacity
    },
    oceanLayers: state.oceanLayers.map((l) =>
      l.id === layerId ? { ...l, opacity } : l
    ),
    ...(layerId === 'copernicus-sst' ? { copernicusSstOpacity: opacity } : {})
  })),

  updateLayerVisibility: (layerId, visible) => set((state) => ({
    oceanLayers: state.oceanLayers.map((l) =>
      l.id === layerId ? { ...l, visible } : l
    )
  })),

  setLayerStatus: (layerId, status) => set((state) => ({
    layerStatuses: {
      ...state.layerStatuses,
      [layerId]: status
    },
    oceanLayers: state.oceanLayers.map((l) =>
      l.id === layerId ? { ...l, status } : l
    ),
    ...(layerId === 'copernicus-sst' ? { copernicusTileStatus: status } : {})
  })),
  
  selectParameter: (param) => set((state) => ({
    selectedParameter: param,
    // Automatically ensure the corresponding layer is marked active
    activeMapLayers: {
      ...state.activeMapLayers,
      [param]: true
    }
  })),
  
  // Canonical coordinate setter updating all related properties in unison
  setSelectedCoordinates: (coords) => set((state) => {
    if (!coords) {
      return {
        selectedCoordinates: null,
        selectedLatitude: null,
        selectedLongitude: null,
        selectedMapData: null
      };
    }
    const closest = getClosestObservation(coords.lat, coords.lng);
    const lat = Number(coords.lat.toFixed(4));
    const lng = Number(coords.lng.toFixed(4));
    return {
      selectedCoordinates: { lat, lng },
      selectedLatitude: lat,
      selectedLongitude: lng,
      selectedMapData: {
        ...closest.observation,
        latitude: lat,
        longitude: lng
      }
    };
  }),
  
  setTimelineMode: (mode) => set((state) => {
    const base = state.latestAvailableTime || state.fallbackTime;
    const computed = computeTimelineFrame(state.timelineIndex, mode, base);
    return {
      timelineMode: mode,
      selectedTimestamp: computed.timestamp,
      timelineFrameType: computed.frameType
    };
  }),
  
  setTimelineIndex: (index) => set((state) => {
    const base = state.latestAvailableTime || state.fallbackTime;
    const computed = computeTimelineFrame(index, state.timelineMode, base);
    return {
      timelineIndex: index,
      selectedTimestamp: computed.timestamp,
      timelineFrameType: computed.frameType
    };
  }),
  
  setIsPlaying: (isPlaying) => set(() => ({
    isPlaying
  })),
  
  setLatestAvailableTime: (time) => set((state) => {
    const computed = computeTimelineFrame(state.timelineIndex, state.timelineMode, time);
    return {
      latestAvailableTime: time,
      selectedTimestamp: computed.timestamp,
      timelineFrameType: computed.frameType
    };
  }),
  
  setAIQuery: (query) => set(() => ({
    currentAIQuery: query
  })),
  
  addAIMessage: (message) => set((state) => ({
    aiMessages: [...state.aiMessages, message]
  })),
  
  clearMessages: () => set(() => ({
    aiMessages: []
  })),
  
  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen
  })),
  
  toggleAssistant: () => set((state) => ({
    assistantOpen: !state.assistantOpen
  })),
  
  toggleStatusDrawer: () => set((state) => ({
    statusDrawerOpen: !state.statusDrawerOpen
  })),

  setSidebarOpen: (open) => set(() => ({
    sidebarOpen: open
  })),

  setAssistantOpen: (open) => set(() => ({
    assistantOpen: open
  })),

  setStatusDrawerOpen: (open) => set(() => ({
    statusDrawerOpen: open
  })),

  setCopernicusSstOpacity: (opacity) => set((state) => ({
    copernicusSstOpacity: opacity,
    layerOpacities: {
      ...state.layerOpacities,
      'copernicus-sst': opacity
    },
    oceanLayers: state.oceanLayers.map((l) =>
      l.id === 'copernicus-sst' ? { ...l, opacity } : l
    )
  })),

  setCopernicusTileStatus: (status) => set((state) => ({
    copernicusTileStatus: status,
    layerStatuses: {
      ...state.layerStatuses,
      'copernicus-sst': status
    },
    oceanLayers: state.oceanLayers.map((l) =>
      l.id === 'copernicus-sst' ? { ...l, status } : l
    )
  }))
}));
