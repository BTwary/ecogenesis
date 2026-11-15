import { DataProvenance } from '../../types';
import { createProvenanceRecord } from './dataProvenanceRegistry';

export interface RiverBasinWaterData {
  basinName: string;
  majorRivers: string[];
  totalReservoirCapacityBcm: number;
  currentLiveStorageBcm: number;
  storagePercentageOfFrl: number; // Full Reservoir Level %
  groundwaterExtractionStagePercent: number; // >100% means critical/over-exploited
  groundwaterCategory: 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';
  annualAverageRainfallMm: number;
  provenance: DataProvenance;
}

export const NWIC_BASIN_RECORDS: Record<string, RiverBasinWaterData> = {
  'Ganga Basin': {
    basinName: 'Ganga River Basin',
    majorRivers: ['Ganga', 'Yamuna', 'Ghaghara', 'Kosi', 'Gandak'],
    totalReservoirCapacityBcm: 58.2,
    currentLiveStorageBcm: 41.8,
    storagePercentageOfFrl: 71.8,
    groundwaterExtractionStagePercent: 74.2,
    groundwaterCategory: 'Semi-Critical',
    annualAverageRainfallMm: 1100,
    provenance: createProvenanceRecord(
      'NWIC National Water Data Portal India',
      'NWIC-CWC-RES-GANGA-2024',
      'Northern India & Indo-Gangetic Plain',
      'Reservoir Live Storage & CGWB Groundwater Stage of Extraction',
      'Billion Cubic Meters (BCM) & %',
      'BCM & Percentage (%)',
      'Central Water Commission (CWC) telemetry at 150 major reservoirs and CGWB piezometer grid',
      'VERIFIED_ARCHIVE',
      { latitude: 25.3176, longitude: 82.9739 },
      'https://indiawris.gov.in/wris',
      'Official India Water Resources Information System (India-WRIS) bulletin'
    )
  },
  'Cauvery Basin': {
    basinName: 'Cauvery River Basin',
    majorRivers: ['Cauvery', 'Hemavati', 'Kabini', 'Bhavani'],
    totalReservoirCapacityBcm: 8.6,
    currentLiveStorageBcm: 6.9,
    storagePercentageOfFrl: 80.2,
    groundwaterExtractionStagePercent: 88.5,
    groundwaterCategory: 'Critical',
    annualAverageRainfallMm: 1075,
    provenance: createProvenanceRecord(
      'NWIC National Water Data Portal India',
      'NWIC-CWC-RES-CAUVERY-2024',
      'Southern Peninsula (Karnataka & Tamil Nadu)',
      'Reservoir Storage Status & Water Balance',
      'BCM & %',
      'BCM & %',
      'CWC Southern Region reservoir telemetry and State Water Resources Department data',
      'VERIFIED_ARCHIVE',
      { latitude: 12.0, longitude: 79.0 },
      'https://indiawris.gov.in'
    )
  },
  'Godavari Basin': {
    basinName: 'Godavari River Basin',
    majorRivers: ['Godavari', 'Pranhita', 'Indravati', 'Manjira'],
    totalReservoirCapacityBcm: 25.4,
    currentLiveStorageBcm: 19.3,
    storagePercentageOfFrl: 76.0,
    groundwaterExtractionStagePercent: 53.6,
    groundwaterCategory: 'Safe',
    annualAverageRainfallMm: 1132,
    provenance: createProvenanceRecord(
      'NWIC National Water Data Portal India',
      'NWIC-CWC-RES-GODAVARI-2024',
      'Central & Deccan Plateau',
      'Reservoir Live Storage & Groundwater Stage',
      'BCM & %',
      'BCM & %',
      'Central Water Commission daily water level reports',
      'VERIFIED_ARCHIVE',
      { latitude: 18.0, longitude: 80.0 },
      'https://cwc.gov.in'
    )
  }
};
