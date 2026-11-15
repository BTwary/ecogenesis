import { DataProvenance } from '../../types';
import { createProvenanceRecord } from './dataProvenanceRegistry';

export interface RegionalForestData {
  regionName: string;
  totalForestCoverMha: number;
  treeCoverLossRatePercent: number;
  netCarbonFluxMtCO2e: number;
  reforestationPotentialHa: number;
  gladAlertsLastMonth: number;
  provenance: DataProvenance;
}

export const GFW_REGIONAL_DATA: Record<string, RegionalForestData> = {
  'South Asia': {
    regionName: 'South Asia (India, Bangladesh, Nepal, Sri Lanka)',
    totalForestCoverMha: 71.3,
    treeCoverLossRatePercent: 0.14,
    netCarbonFluxMtCO2e: -28.4, // Net sink due to afforestation and agroforestry
    reforestationPotentialHa: 1420000,
    gladAlertsLastMonth: 3820,
    provenance: createProvenanceRecord(
      'Global Forest Watch',
      'GFW-TROPICAL-LOSS-SOUTH-ASIA',
      'South Asia Subcontinent',
      'Tree Cover Loss & Carbon Flux',
      'Hectares & Megatonnes CO2e',
      'Million Hectares (Mha) & MtCO2e',
      'Landsat 30m multi-spectral Hansen GLAD tree canopy density change detection',
      'VERIFIED_ARCHIVE',
      { latitude: 20.5937, longitude: 78.9629 },
      'https://www.globalforestwatch.org/dashboards/country/IND/',
      'Includes Forest Survey of India (ISFR 2021) ground truth calibration'
    )
  },
  'Global': {
    regionName: 'Global Terrestrial Forest Biomes',
    totalForestCoverMha: 4060,
    treeCoverLossRatePercent: 0.58,
    netCarbonFluxMtCO2e: 7600, // Gross emissions from deforestation
    reforestationPotentialHa: 900000000, // 0.9 billion hectares potential (Bastin et al.)
    gladAlertsLastMonth: 124500,
    provenance: createProvenanceRecord(
      'Global Forest Watch',
      'GFW-GLOBAL-TREE-COVER-ANNUAL',
      'Worldwide',
      'Global Tree Cover Extent & Loss',
      'Mha',
      'Million Hectares',
      'WRI Global Forest Watch & UMD GLAD laboratory global annual synthesis',
      'VERIFIED_ARCHIVE',
      undefined,
      'https://www.globalforestwatch.org'
    )
  }
};
