/** Shared city presets for location-based environmental lookups.
 * cpcbCity is set only for Indian locations intended for city-filtered
 * data.gov.in/CPCB queries. An empty value means CPCB is not queried.
 */
export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  cpcbCity?: string;
}

export const CITIES: City[] = [
  { id: "delhi", name: "Delhi", lat: 28.61, lng: 77.21, cpcbCity: "Delhi" },
  { id: "mumbai", name: "Mumbai", lat: 19.07, lng: 72.87, cpcbCity: "Mumbai" },
  { id: "bengaluru", name: "Bengaluru", lat: 12.97, lng: 77.59, cpcbCity: "Bengaluru" },
  { id: "chennai", name: "Chennai", lat: 13.08, lng: 80.27, cpcbCity: "Chennai" },
  { id: "kolkata", name: "Kolkata", lat: 22.57, lng: 88.36, cpcbCity: "Kolkata" },
  { id: "hyderabad", name: "Hyderabad", lat: 17.38, lng: 78.48, cpcbCity: "Hyderabad" },
  { id: "patna", name: "Patna", lat: 25.61, lng: 85.14, cpcbCity: "Patna" },
  { id: "dhanbad", name: "Dhanbad", lat: 23.80, lng: 86.44, cpcbCity: "Dhanbad" },
  { id: "ranchi", name: "Ranchi", lat: 23.36, lng: 85.33, cpcbCity: "Ranchi" },
  { id: "jamshedpur", name: "Jamshedpur", lat: 22.80, lng: 86.20, cpcbCity: "Jamshedpur" },
  { id: "bhubaneswar", name: "Bhubaneswar", lat: 20.30, lng: 85.82, cpcbCity: "Bhubaneswar" },
  { id: "lucknow", name: "Lucknow", lat: 26.85, lng: 80.95, cpcbCity: "Lucknow" },
  { id: "kanpur", name: "Kanpur", lat: 26.45, lng: 80.33, cpcbCity: "Kanpur" },
  { id: "varanasi", name: "Varanasi", lat: 25.32, lng: 82.97, cpcbCity: "Varanasi" },
  { id: "jaipur", name: "Jaipur", lat: 26.91, lng: 75.79, cpcbCity: "Jaipur" },
  { id: "ahmedabad", name: "Ahmedabad", lat: 23.02, lng: 72.57, cpcbCity: "Ahmedabad" },
  { id: "pune", name: "Pune", lat: 18.52, lng: 73.86, cpcbCity: "Pune" },
  { id: "nagpur", name: "Nagpur", lat: 21.15, lng: 79.09, cpcbCity: "Nagpur" },
  { id: "bhopal", name: "Bhopal", lat: 23.26, lng: 77.41, cpcbCity: "Bhopal" },
  { id: "indore", name: "Indore", lat: 22.72, lng: 75.86, cpcbCity: "Indore" },
  { id: "guwahati", name: "Guwahati", lat: 26.14, lng: 91.74, cpcbCity: "Guwahati" },
  { id: "dehradun", name: "Dehradun", lat: 30.32, lng: 78.03, cpcbCity: "Dehradun" },
  { id: "london", name: "London", lat: 51.51, lng: -0.13 },
  { id: "newyork", name: "New York", lat: 40.71, lng: -74.01 },
  { id: "tokyo", name: "Tokyo", lat: 35.68, lng: 139.65 },
  { id: "saopaulo", name: "São Paulo", lat: -23.55, lng: -46.63 },
  { id: "nairobi", name: "Nairobi", lat: -1.29, lng: 36.82 },
  { id: "sydney", name: "Sydney", lat: -33.87, lng: 151.21 },
];
