export interface NorthernDestination {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  elevationM: number;
}

/** Northern Pakistan expedition destinations with fixed coordinates for live weather lookups */
export const NORTHERN_PAKISTAN_DESTINATIONS: NorthernDestination[] = [
  { id: "hunza", name: "Hunza Valley", region: "Gilgit-Baltistan", lat: 36.3167, lon: 74.65, elevationM: 2438 },
  { id: "skardu", name: "Skardu", region: "Gilgit-Baltistan", lat: 35.2971, lon: 75.6333, elevationM: 2234 },
  { id: "swat", name: "Swat Valley", region: "Khyber Pakhtunkhwa", lat: 35.222, lon: 72.4258, elevationM: 975 },
  { id: "naran", name: "Naran Kaghan", region: "Khyber Pakhtunkhwa", lat: 34.9039, lon: 73.6501, elevationM: 2500 },
  { id: "fairy-meadows", name: "Fairy Meadows", region: "Gilgit-Baltistan", lat: 35.381, lon: 74.59, elevationM: 3300 },
  { id: "gilgit", name: "Gilgit City", region: "Gilgit-Baltistan", lat: 35.9208, lon: 74.3144, elevationM: 1479 },
  { id: "chitral", name: "Chitral", region: "Khyber Pakhtunkhwa", lat: 35.8518, lon: 71.7864, elevationM: 1494 },
  { id: "kalam", name: "Kalam", region: "Khyber Pakhtunkhwa", lat: 35.4923, lon: 72.586, elevationM: 2001 },
  { id: "malam-jabba", name: "Malam Jabba", region: "Khyber Pakhtunkhwa", lat: 34.798, lon: 72.571, elevationM: 2650 },
  { id: "nathia-gali", name: "Nathia Gali", region: "Khyber Pakhtunkhwa", lat: 34.075, lon: 73.381, elevationM: 2410 },
];

export function getDestinationById(id: string): NorthernDestination | undefined {
  return NORTHERN_PAKISTAN_DESTINATIONS.find((d) => d.id === id);
}

export const DEFAULT_DESTINATION_ID = "hunza";
