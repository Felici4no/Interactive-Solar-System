/*
  # Create Host Stars Table

  1. New Tables
    - `host_stars`
      - `id` (uuid, primary key) - Unique identifier for each host star
      - `hostname` (text, unique, required) - Name of the host star
      - `st_teff` (numeric) - Effective temperature in Kelvin
      - `st_rad` (numeric) - Stellar radius in solar radii
      - `st_dist_ly` (numeric) - Distance from Earth in light-years
      - `position_x` (numeric) - X coordinate in 3D space
      - `position_y` (numeric) - Y coordinate in 3D space
      - `position_z` (numeric) - Z coordinate in 3D space
      - `color` (text) - Hex color code for 3D visualization
      - `created_by` (uuid) - User who created this record
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Changes to existing tables
    - Add foreign key from `exoplanets.host_star` to `host_stars.hostname`
    - Create index on hostname for faster lookups

  3. Security
    - Enable RLS on `host_stars` table
    - Allow anyone to read host star data (public exploration)
    - Allow authenticated users to create new host stars
    - Allow users to update their own host star entries
    - Allow users to delete their own host star entries (with cascade to exoplanets)
*/

CREATE TABLE IF NOT EXISTS host_stars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname text UNIQUE NOT NULL,
  st_teff numeric DEFAULT 5000,
  st_rad numeric DEFAULT 1.0,
  st_dist_ly numeric DEFAULT 500,
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  position_z numeric DEFAULT 0,
  color text DEFAULT '#FDB813',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE host_stars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view host stars"
  ON host_stars
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create host stars"
  ON host_stars
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own host stars"
  ON host_stars
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own host stars"
  ON host_stars
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_host_stars_hostname ON host_stars(hostname);
CREATE INDEX IF NOT EXISTS idx_host_stars_created_at ON host_stars(created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exoplanets' AND column_name = 'host_star_id'
  ) THEN
    ALTER TABLE exoplanets ADD COLUMN host_star_id uuid REFERENCES host_stars(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_exoplanets_host_star_id ON exoplanets(host_star_id);
  END IF;
END $$;
