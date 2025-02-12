/*
  # Add missing columns to campers table

  1. Changes
    - Add missing columns to campers table to match application requirements:
      - birth_date (date)
      - age (integer)
      - gender (text with check constraint)
      - phone (text)
      - address (text)
      - department (text)
      - guardian_name (text)
      - guardian_phone (text)

  2. Security
    - No changes to security policies
*/

-- Add missing columns to campers table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'birth_date') THEN
    ALTER TABLE campers ADD COLUMN birth_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'age') THEN
    ALTER TABLE campers ADD COLUMN age integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'gender') THEN
    ALTER TABLE campers ADD COLUMN gender text CHECK (gender IN ('M', 'F'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'phone') THEN
    ALTER TABLE campers ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'address') THEN
    ALTER TABLE campers ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'department') THEN
    ALTER TABLE campers ADD COLUMN department text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'guardian_name') THEN
    ALTER TABLE campers ADD COLUMN guardian_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campers' AND column_name = 'guardian_phone') THEN
    ALTER TABLE campers ADD COLUMN guardian_phone text;
  END IF;
END $$;