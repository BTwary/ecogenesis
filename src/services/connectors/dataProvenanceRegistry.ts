import { DataProvenance, DataSourceProvider, DataQualityStatus } from '../../types';

export interface SourceIntegrationMeta {
  provider: DataSourceProvider;
  status: 'OPERATIONAL_LIVE' | 'OPERATIONAL_CACHED_ARCHIVE' | 'CONNECTOR_READY_RESTRICTED_KEY';
  coverage: string;
  updateFrequency: string;
  license: string;
  officialEndpoint: string;
  authenticationType: 'None (Open Public)' | 'Free Registration Key' | 'Government Restricted Token' | 'Token / Session';
  notes: string;
  sampleParameters: string[];
}

export const DATA_SOURCE_REGISTRY: Record<string, SourceIntegrationMeta> = {
  'Open-Meteo': {
    provider: 'Open-Meteo',
    status: 'OPERATIONAL_LIVE',
    coverage: 'Global terrestrial (11km grid resolution)',
    updateFrequency: 'Hourly updates, 00:00 & 12:00 UTC model runs',
    license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    officialEndpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    authenticationType: 'None (Open Public)',
    notes: 'Direct CORS-enabled open access. Combined with CAMS, ECMWF, and NOAA GFS models.',
    sampleParameters: ['pm2_5', 'pm10', 'nitrogen_dioxide', 'ozone', 'carbon_monoxide', 'direct_radiation', 'precipitation']
  },
  'NASA POWER': {
    provider: 'NASA POWER',
    status: 'OPERATIONAL_LIVE',
    coverage: 'Global 0.5° x 0.5° latitude/longitude grid',
    updateFrequency: 'Daily satellite assimilation',
    license: 'NASA Open Data Policy (Public Domain / US Government Work)',
    officialEndpoint: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    authenticationType: 'None (Open Public)',
    notes: 'Prediction Of Worldwide Energy Resources project by NASA Langley Research Center.',
    sampleParameters: ['ALLSKY_SFC_SW_DWN (Solar Irradiance)', 'T2M (Air Temp at 2m)', 'PRECTOTCORR (Precipitation)']
  },
  'GBIF': {
    provider: 'GBIF',
    status: 'OPERATIONAL_LIVE',
    coverage: 'Worldwide biodiversity observations (>2.2 billion records)',
    updateFrequency: 'Continuous ingestion from museums, citizen science & research institutions',
    license: 'CC0, CC-BY 4.0, CC-BY-NC 4.0',
    officialEndpoint: 'https://api.gbif.org/v1/occurrence/search',
    authenticationType: 'None (Open Public)',
    notes: 'Global Biodiversity Information Facility API. Zero token requirement for search queries.',
    sampleParameters: ['decimalLatitude', 'decimalLongitude', 'species', 'family', 'basisOfRecord', 'media']
  },
  'CPCB India / data.gov.in': {
    provider: 'CPCB India / data.gov.in',
    status: 'OPERATIONAL_CACHED_ARCHIVE',
    coverage: 'India (Continuous Ambient Air Quality Monitoring Stations across 300+ cities)',
    updateFrequency: 'Hourly station measurements',
    license: 'Government Open Data License - India (GODL)',
    officialEndpoint: 'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
    authenticationType: 'Free Registration Key',
    notes: 'Integrated with verified CAAQMS station datasets (Delhi Anand Vihar, Mumbai Bandra, Bengaluru BTM). Live fallback dynamically mapped to regional coordinates via Open-Meteo.',
    sampleParameters: ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'AQI_Sub_Index']
  },
  'Copernicus Climate Service': {
    provider: 'Copernicus Climate Service',
    status: 'OPERATIONAL_CACHED_ARCHIVE',
    coverage: 'Global reanalysis & Sentinel constellation observations',
    updateFrequency: 'Monthly climate bulletin & Sentinel-5P daily orbits',
    license: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)',
    officialEndpoint: 'https://cds.climate.copernicus.eu/api/v2',
    authenticationType: 'Free Registration Key',
    notes: 'ERA5 global temperature anomalies (+1.48°C pre-industrial reference), Sentinel-5P tropospheric NO2 column observations.',
    sampleParameters: ['Surface Temperature Anomaly', 'Sentinel-5P NO2 column', 'Sea Ice Extent']
  },
  'OpenAQ': {
    provider: 'OpenAQ',
    status: 'OPERATIONAL_CACHED_ARCHIVE',
    coverage: 'Global physical and sensor-based air quality stations',
    updateFrequency: 'Hourly telemetry ingestion',
    license: 'CC BY 4.0',
    officialEndpoint: 'https://api.openaq.org/v3/locations',
    authenticationType: 'Free Registration Key',
    notes: 'Global open air monitoring aggregator. Normalized against WHO 2021 air quality guidelines.',
    sampleParameters: ['pm25', 'pm10', 'no2', 'o3', 'so2']
  },
  'Global Forest Watch': {
    provider: 'Global Forest Watch',
    status: 'OPERATIONAL_CACHED_ARCHIVE',
    coverage: 'Global forest lands (University of Maryland / Hansen Landsat analysis)',
    updateFrequency: 'Annual tree cover loss updates & weekly GLAD deforestation alerts',
    license: 'Creative Commons Attribution 4.0 International',
    officialEndpoint: 'https://data-api.globalforestwatch.org',
    authenticationType: 'Free Registration Key',
    notes: 'Deforestation monitoring, tree canopy density (>30%), primary tropical forest loss rates.',
    sampleParameters: ['tree_cover_loss_hectares', 'primary_forest_loss_rate', 'carbon_emissions_forest_loss']
  },
  'NWIC National Water Data Portal India': {
    provider: 'NWIC National Water Data Portal India',
    status: 'OPERATIONAL_CACHED_ARCHIVE',
    coverage: 'All major Indian river basins & 150 Central Water Commission monitored reservoirs',
    updateFrequency: 'Weekly reservoir storage bulletins & seasonal groundwater level reports',
    license: 'Government Open Data License - India (GODL)',
    officialEndpoint: 'https://indiawris.gov.in/wris',
    authenticationType: 'Government Restricted Token',
    notes: 'Central Ground Water Board (CGWB) & Central Water Commission (CWC). Reservoir live capacity (%) and groundwater stage of extraction indicators.',
    sampleParameters: ['Live Storage (BCM)', 'Storage % of FRL', 'Groundwater Extraction Stage (%)']
  }
};

export function createProvenanceRecord(
  provider: DataSourceProvider,
  datasetId: string,
  locationName: string,
  measurementParameter: string,
  rawUnit: string,
  normalizedUnit: string,
  methodology: string,
  qualityStatus: DataQualityStatus,
  coordinates?: { latitude: number; longitude: number },
  sourceUrlOverride?: string,
  notes?: string
): DataProvenance {
  const meta = DATA_SOURCE_REGISTRY[provider];
  return {
    provider,
    datasetId,
    locationName,
    coordinates,
    observationTimestamp: new Date().toISOString(),
    retrievalTimestamp: new Date().toISOString(),
    measurementParameter,
    rawUnit,
    normalizedUnit,
    methodology,
    qualityStatus,
    sourceUrl: sourceUrlOverride || meta?.officialEndpoint || 'https://data.gov.in',
    license: meta?.license || 'Open Data Standard',
    confidenceScore: qualityStatus === 'VERIFIED_LIVE' ? 95 : qualityStatus === 'VERIFIED_ARCHIVE' ? 90 : 80,
    notes
  };
}
