import { GlobalClimateIndicators, DataProvenance } from '../../types';
import { createProvenanceRecord } from './dataProvenanceRegistry';

export function getCopernicusClimateIndicators(): GlobalClimateIndicators {
  return {
    atmosphericCO2: {
      value: 426.9,
      unit: 'ppm',
      date: 'Monthly NOAA Mauna Loa & CAMS reanalysis',
      provenance: createProvenanceRecord(
        'Copernicus Climate Service',
        'CAMS-GHG-CO2-GLOBAL',
        'Global Marine Boundary Layer / Mauna Loa Observatory',
        'Atmospheric Carbon Dioxide Mole Fraction',
        'µmol/mol (ppm)',
        'parts per million (ppm)',
        'In-situ non-dispersive infrared (NDIR) spectroscopy assimilated into ECMWF CAMS atmospheric model',
        'VERIFIED_ARCHIVE',
        { latitude: 19.5362, longitude: -155.5763 },
        'https://atmosphere.copernicus.eu',
        'World standard NOAA Global Monitoring Laboratory and Copernicus CAMS global greenhouse gas monitoring'
      )
    },
    globalTempAnomaly: {
      value: 1.48,
      unit: '°C above pre-industrial',
      baseline: '1850–1900 pre-industrial reference period',
      provenance: createProvenanceRecord(
        'Copernicus Climate Service',
        'ERA5-GLOBAL-TEMP-ANOMALY-1850',
        'Global Terrestrial & Ocean Surface',
        'Surface Air Temperature Anomaly',
        'Kelvin deviation',
        '°C Anomaly',
        'Copernicus ERA5 global climate reanalysis dataset incorporating billions of satellite and weather station measurements',
        'VERIFIED_ARCHIVE',
        undefined,
        'https://climate.copernicus.eu/surface-air-temperature-monthly-bulletins',
        'European Centre for Medium-Range Weather Forecasts (ECMWF)'
      )
    },
    forestLossRate: {
      value: 3.7,
      unit: 'Million Hectares / Year (Tropical Primary)',
      year: 'University of Maryland / GFW latest baseline',
      provenance: createProvenanceRecord(
        'Global Forest Watch',
        'GFW-TREE-COVER-LOSS-UMD-GLAD',
        'Global Tropical Biomes',
        'Primary Humid Tropical Forest Loss',
        'Hectares/year',
        'Million Hectares/year',
        'Time-series analysis of 30-meter Landsat and Sentinel-2 satellite imagery (Hansen et al.)',
        'VERIFIED_ARCHIVE',
        undefined,
        'https://www.globalforestwatch.org',
        'World Resources Institute (WRI) & Global Land Analysis & Discovery (GLAD) lab'
      )
    },
    oceanHeatContent: {
      value: 345,
      unit: 'ZettaJoules (0-2000m anomaly)',
      baseline: '1981–2010 climatology',
      provenance: createProvenanceRecord(
        'Copernicus Climate Service',
        'COPERNICUS-INSITU-ARGO-OHC',
        'Global Oceans (0 - 2000m Depth)',
        'Ocean Heat Content (OHC)',
        '10^21 Joules',
        'ZettaJoules (ZJ)',
        'Autonomous Argo profiling float array telemetry combined with satellite altimetry data',
        'VERIFIED_ARCHIVE',
        undefined,
        'https://marine.copernicus.eu',
        'Copernicus Marine Environment Monitoring Service (CMEMS)'
      )
    }
  };
}
