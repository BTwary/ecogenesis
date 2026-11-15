import { 
  SustainabilityGoal, 
  SustainabilityChallenge, 
  ActivityLog, 
  CitizenScienceObservation, 
  WasteLogEntry, 
  CommunityInitiative,
  PersonaType 
} from '../types';

const STORAGE_KEYS = {
  PERSONA: 'ecogenesis_persona',
  GOALS: 'ecogenesis_goals',
  CHALLENGES: 'ecogenesis_challenges',
  ACTIVITIES: 'ecogenesis_activities',
  OBSERVATIONS: 'ecogenesis_observations',
  WASTE_LOGS: 'ecogenesis_waste_logs',
  INITIATIVES: 'ecogenesis_initiatives',
  BADGES: 'ecogenesis_badges'
};

export const INITIAL_GOALS: SustainabilityGoal[] = [
  {
    id: 'g-1',
    title: 'Cut Home Electricity Consumption by 15%',
    category: 'energy',
    targetValue: 15,
    currentValue: 9.5,
    unit: '% reduction',
    deadline: '2026-12-31',
    completed: false
  },
  {
    id: 'g-2',
    title: 'Zero Single-Use Plastic Packaging',
    category: 'waste',
    targetValue: 30,
    currentValue: 24,
    unit: 'days streak',
    deadline: '2026-11-30',
    completed: false
  },
  {
    id: 'g-3',
    title: 'Switch 3 Commutes/Week to Public Transit or Metro',
    category: 'mobility',
    targetValue: 12,
    currentValue: 8,
    unit: 'trips/month',
    deadline: '2026-11-30',
    completed: false
  },
  {
    id: 'g-4',
    title: 'Harvest & Store 15,000 Litres of Rainwater',
    category: 'water',
    targetValue: 15000,
    currentValue: 11200,
    unit: 'Litres',
    deadline: '2026-12-31',
    completed: false
  }
];

export const INITIAL_CHALLENGES: SustainabilityChallenge[] = [
  {
    id: 'c-1',
    title: 'The 30-Day Zero Food Waste Sprint',
    description: 'Plan meal portions, store perishables with FIFO (first-in first-out), and compost 100% of organic vegetable scraps.',
    durationDays: 30,
    participantsCount: 1420,
    category: 'food',
    impactDescription: 'Diverts an estimated 22 kg of organic waste and avoids 28 kg CO2e per participant.',
    active: true
  },
  {
    id: 'c-2',
    title: 'Cold Wash & Line Dry Sprint',
    description: 'Wash clothes exclusively on 20°C/30°C cold cycles and dry in open air rather than using electric tumble dryers.',
    durationDays: 21,
    participantsCount: 890,
    category: 'energy',
    impactDescription: 'Saves ~45 kWh of high-power thermal electricity per household.',
    active: true
  },
  {
    id: 'c-3',
    title: 'Native Pollinator Sanctuary Challenge',
    description: 'Plant at least 3 flowering native perennial plants or create a chemical-free balcony bee hotel.',
    durationDays: 14,
    participantsCount: 654,
    category: 'nature',
    impactDescription: 'Restores essential micro-habitats for solitary bees and butterflies.',
    active: true
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    date: '2026-11-14',
    category: 'Mobility',
    description: 'Commuted 18 km via electric metro instead of solo petrol car',
    verifiedImpact: { carbonSavedKg: 3.4, waterSavedLitres: 0 }
  },
  {
    id: 'act-2',
    date: '2026-11-13',
    category: 'Energy',
    description: 'Cleaned split AC air filters & reset temperature setpoint to 24°C',
    verifiedImpact: { carbonSavedKg: 2.1, waterSavedLitres: 0 }
  },
  {
    id: 'act-3',
    date: '2026-11-11',
    category: 'Water',
    description: 'Installed 4.5 LPM low-flow aerators on kitchen and bathroom faucets',
    verifiedImpact: { carbonSavedKg: 0.2, waterSavedLitres: 340 }
  }
];

export const INITIAL_OBSERVATIONS: CitizenScienceObservation[] = [
  {
    id: 'obs-1',
    speciesName: 'Apis cerana (Asiatic Honey Bee)',
    category: 'Pollinator',
    latitude: 28.6139,
    longitude: 77.2090,
    locationObfuscated: true,
    notes: 'Active pollen-foraging on flowering neem blossom canopy.',
    timestamp: '2026-11-12 10:45 AM',
    verified: true,
    photoUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'obs-2',
    speciesName: 'Psittacula krameri (Rose-ringed Parakeet)',
    category: 'Fauna',
    latitude: 28.5830,
    longitude: 77.2210,
    locationObfuscated: true,
    notes: 'Flock of 6 roosting in old-growth banyan tree hollow.',
    timestamp: '2026-11-10 05:20 PM',
    verified: true,
    photoUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=400&q=80'
  }
];

export const INITIAL_COMMUNITY_INITIATIVES: CommunityInitiative[] = [
  {
    id: 'init-1',
    title: 'Yamuna Riverbank Riparian Wetland Restoration',
    organization: 'Delhi Green River Trust & Citizen Volunteers',
    category: 'Water & Biodiversity',
    participants: 340,
    targetParticipants: 500,
    verifiedImpact: '4.2 km riverbank cleared of plastics; 12,000 native vetiver grass clumps planted',
    status: 'In Progress',
    location: 'Delhi, India',
    startDate: '2026-10-15'
  },
  {
    id: 'init-2',
    title: 'Community Rooftop Solar Co-operative Sprint',
    organization: 'Bangalore Clean Energy Citizens League',
    category: 'Renewable Energy',
    participants: 85,
    targetParticipants: 100,
    verifiedImpact: '380 kWp combined rooftop solar tendered under bulk aggregate discount',
    status: 'In Progress',
    location: 'Bengaluru, India',
    startDate: '2026-11-01'
  },
  {
    id: 'init-3',
    title: 'Urban Dense Miyawaki Micro-Forest Cultivation',
    organization: 'Afforestt & Rotary Club Green Wing',
    category: 'Reforestation',
    participants: 620,
    targetParticipants: 600,
    verifiedImpact: '3,200 native saplings planted across 0.5 acre abandoned municipal lot',
    status: 'Completed',
    location: 'Mumbai, India',
    startDate: '2026-09-01'
  }
];

export class StorageService {
  static getPersona(): PersonaType {
    return (localStorage.getItem(STORAGE_KEYS.PERSONA) as PersonaType) || 'individual';
  }

  static setPersona(persona: PersonaType): void {
    localStorage.setItem(STORAGE_KEYS.PERSONA, persona);
  }

  static getGoals(): SustainabilityGoal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? JSON.parse(raw) : INITIAL_GOALS;
  }

  static saveGoals(goals: SustainabilityGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  static getChallenges(): SustainabilityChallenge[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    return raw ? JSON.parse(raw) : INITIAL_CHALLENGES;
  }

  static getActivities(): ActivityLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : INITIAL_ACTIVITIES;
  }

  static addActivity(activity: ActivityLog): void {
    const list = this.getActivities();
    list.unshift(activity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list));
  }

  static getObservations(): CitizenScienceObservation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OBSERVATIONS);
    return raw ? JSON.parse(raw) : INITIAL_OBSERVATIONS;
  }

  static addObservation(obs: CitizenScienceObservation): void {
    const list = this.getObservations();
    list.unshift(obs);
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(list));
  }

  static getInitiatives(): CommunityInitiative[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INITIATIVES);
    return raw ? JSON.parse(raw) : INITIAL_COMMUNITY_INITIATIVES;
  }

  static addInitiative(init: CommunityInitiative): void {
    const list = this.getInitiatives();
    list.unshift(init);
    localStorage.setItem(STORAGE_KEYS.INITIATIVES, JSON.stringify(list));
  }
}
