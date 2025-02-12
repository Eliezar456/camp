-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON campers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON campers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON campers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON campers;

-- Create new policies with admin check
CREATE POLICY "Enable read access for all authenticated users"
  ON campers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for admins and leaders"
  ON campers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_admin() OR 
    EXISTS (
      SELECT 1 FROM leaders 
      WHERE name = current_user
    )
  );

CREATE POLICY "Enable update access for admins and leaders"
  ON campers
  FOR UPDATE
  TO authenticated
  USING (
    auth.is_admin() OR 
    EXISTS (
      SELECT 1 FROM leaders 
      WHERE name = current_user
    )
  )
  WITH CHECK (
    auth.is_admin() OR 
    EXISTS (
      SELECT 1 FROM leaders 
      WHERE name = current_user
    )
  );

CREATE POLICY "Enable delete access for admins only"
  ON campers
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());