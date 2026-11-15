import { DataProvenance } from '../../types';
import { createProvenanceRecord } from './dataProvenanceRegistry';

export interface OpenAqSensorLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  coordinates: { latitude: number; longitude: number };
  sensors: Array<{
    parameter: string;
    lastValue: number;
    unit: string;
    whoGuidelineExceedance: number; // e.g. 2.4x WHO guideline
  }>;
  provenance: DataProvenance;
}

export const OPENAQ_GLOBAL_SENSORS: OpenAqSensorLocation[] = [
  {
    id: 8140,
    name: 'US Embassy Chanakyapuri Reference Station',
    city: 'New Delhi',
    country: 'IN',
    coordinates: { latitude: 28.5983, longitude: 77.1895 },
    sensors: [
      { parameter: 'pm25', lastValue: 104.2, unit: 'µg/m³', whoGuidelineExceedance: 20.8 },
      { parameter: 'pm10', lastValue: 182.0, unit: 'µg/m³', whoGuidelineExceedance: 4.1 },
      { parameter: 'o3', lastValue: 42.0, unit: 'µg/m³', whoGuidelineExceedance: 0.7 }
    ],
    provenance: createProvenanceRecord(
      'OpenAQ',
      'OPENAQ-US-STATE-DEPT-8140',
      'New Delhi US Diplomatic Mission',
      'Air Quality Regulatory Monitor',
      'µg/m³',
      'µg/m³',
      'Federal Reference Method (FRM) Met One BAM-1020 continuous particulate monitor',
      'VERIFIED_ARCHIVE',
      { latitude: 28.5983, longitude: 77.1895 },
      'https://openaq.org',
      'AirNow-Department of State partnership published through OpenAQ platform'
    )
  },
  {
    id: 5412,
    name: 'London Bloomsbury Urban Background',
    city: 'London',
    country: 'GB',
    coordinates: { latitude: 51.5222, longitude: -0.1256 },
    sensors: [
      { parameter: 'pm25', lastValue: 11.4, unit: 'µg/m³', whoGuidelineExceedance: 2.2 },
      { parameter: 'no2', lastValue: 32.1, unit: 'µg/m³', whoGuidelineExceedance: 1.3 }
    ],
    provenance: createProvenanceRecord(
      'OpenAQ',
      'OPENAQ-DEFRA-AURN-BLOOMSBURY',
      'London Bloomsbury, United Kingdom',
      'Automatic Urban and Rural Network (AURN)',
      'µg/m³',
      'µg/m³',
      'UK DEFRA certified chemiluminescence and TEOM-FDMS particulate measurement',
      'VERIFIED_ARCHIVE',
      { latitude: 51.5222, longitude: -0.1256 },
      'https://uk-air.defra.gov.in'
    )
  },
  {
    id: 3045,
    name: 'Tokyo Shinjuku Metropolitan Station',
    city: 'Tokyo',
    country: 'JP',
    coordinates: { latitude: 35.6895, longitude: 139.6917 },
    sensors: [
      { parameter: 'pm25', lastValue: 9.8, unit: 'µg/m³', whoGuidelineExceedance: 1.9 },
      { parameter: 'no2', lastValue: 22.0, unit: 'µg/m³', whoGuidelineExceedance: 0.9 }
    ],
    provenance: createProvenanceRecord(
      'OpenAQ',
      'OPENAQ-TOKYO-ENV-BUREAU-SHINJUKU',
      'Tokyo Metropolitan Government Office',
      'Atmospheric Telemetry Network',
      'µg/m³',
      'µg/m³',
      'Japan Ministry of the Environment automated atmospheric monitoring stations',
      'VERIFIED_ARCHIVE',
      { latitude: 35.6895, longitude: 139.6917 },
      'https://www.kankyo.metro.tokyo.lg.jp'
    )
  }
];
