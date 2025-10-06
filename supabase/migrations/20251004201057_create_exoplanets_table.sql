/*
  # Create Exoplanets Table

  1. New Tables
    - `exoplanets`
      - `id` (uuid, primary key) - Unique identifier for each exoplanet
      - `name` (text, required) - Name of the exoplanet
      - `distance_from_sun` (text) - Distance from our solar system
      - `discovery_date` (text) - Date when the exoplanet was discovered
      - `mass` (text) - Mass of the exoplanet
      - `radius` (text) - Radius/size of the exoplanet
      - `orbital_period` (text) - Time to complete one orbit
      - `temperature` (text) - Surface/atmospheric temperature
      - `host_star` (text) - Name of the host star
      - `discovery_method` (text) - Method used to discover the exoplanet
      - `observations` (text) - Scientific observations and notes
      - `color` (text) - Hex color code for 3D visualization
      - `position_x` (numeric) - X coordinate in 3D space
      - `position_y` (numeric) - Y coordinate in 3D space
      - `position_z` (numeric) - Z coordinate in 3D space
      - `size` (numeric) - Size multiplier for 3D rendering
      - `created_by` (uuid) - User who created/discovered this record
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `exoplanets` table
    - Allow anyone to read exoplanet data (public exploration)
    - Allow authenticated users to create new exoplanets
    - Allow users to update their own exoplanet entries
    - Allow users to delete their own exoplanet entries
*/

CREATE TABLE IF NOT EXISTS exoplanets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  distance_from_sun text DEFAULT '',
  discovery_date text DEFAULT '',
  mass text DEFAULT '',
  radius text DEFAULT '',
  orbital_period text DEFAULT '',
  temperature text DEFAULT '',
  host_star text DEFAULT '',
  discovery_method text DEFAULT '',
  observations text DEFAULT '',
  color text DEFAULT '#888888',
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  position_z numeric DEFAULT 0,
  size numeric DEFAULT 0.3,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exoplanets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exoplanets"
  ON exoplanets
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create exoplanets"
  ON exoplanets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own exoplanets"
  ON exoplanets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own exoplanets"
  ON exoplanets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_exoplanets_created_at ON exoplanets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exoplanets_name ON exoplanets(name);
