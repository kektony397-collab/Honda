export interface PositionEntry {
  lat: number;
  lon: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface SessionStats {
  km: number;
  avgKmh: number;
  areaM2: number;
}

export interface SavedSession {
  id: number;
  name: string;
  createdAt: number;
  positions: PositionEntry[];
  stats: SessionStats;
}

export interface FuelLogEntry {
  id: number;
  liters: number;
  timestamp: number;
}
