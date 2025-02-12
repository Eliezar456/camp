/*
  # Update RLS policies for campers table

  1. Security Changes
    - Drop existing RLS policies for campers table
    - Add new policies that properly handle authentication
    - Ensure all authenticated users can perform CRUD operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read campers" ON campers;
DROP POLICY IF EXISTS "Allow authenticated users to insert campers" ON campers;
DROP POLICY IF EXISTS "Allow authenticated users to update campers" ON campers;
DROP POLICY IF EXISTS "Allow authenticated users to delete campers" ON campers;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON campers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON campers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON campers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON campers
  FOR DELETE
  TO authenticated
  USING (true);