import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HostStar {
  id?: string;
  hostname: string;
  st_teff: number;
  st_rad: number;
  st_dist_ly: number;
  position_x: number;
  position_y: number;
  position_z: number;
  color: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Exoplanet {
  id?: string;
  name: string;
  distance_from_sun: string;
  discovery_date: string;
  mass: string;
  radius: string;
  orbital_period: string;
  temperature: string;
  host_star: string;
  host_star_id?: string;
  discovery_method: string;
  observations: string;
  color: string;
  position_x: number;
  position_y: number;
  position_z: number;
  size: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
