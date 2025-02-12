/*
  # Initial schema setup

  1. New Tables
    - `leaders`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `assigned_spots` (integer)
      - `used_spots` (integer)
      - `created_at` (timestamp)
      
    - `campers`
      - `id` (uuid, primary key)
      - `sequential_number` (integer)
      - `full_name` (text)
      - `institution` (text)
      - `leader_id` (uuid, foreign key)
      - `birth_date` (date)
      - `age` (integer)
      - `gender` (text)
      - `phone` (text)
      - `address` (text)
      - `department` (text)
      - `guardian_name` (text)
      - `guardian_phone` (text)
      - `created_at` (timestamp)

    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `attachments` (jsonb)

    - `messages`
      - `id` (uuid, primary key)
      - `sender` (text)
      - `content` (text)
      - `created_at` (timestamp)

    - `tracking_entries`
      - `id` (uuid, primary key)
      - `camper_id` (uuid, foreign key)
      - `decision` (text)
      - `created_at` (timestamp)

    - `documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `url` (text)
      - `file_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leaders table
CREATE TABLE IF NOT EXISTS leaders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  assigned_spots integer NOT NULL DEFAULT 0,
  used_spots integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read leaders"
  ON leaders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert leaders"
  ON leaders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update leaders"
  ON leaders
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete leaders"
  ON leaders
  FOR DELETE
  TO authenticated
  USING (true);

-- Campers table
CREATE TABLE IF NOT EXISTS campers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequential_number integer NOT NULL,
  full_name text NOT NULL,
  institution text NOT NULL,
  leader_id uuid REFERENCES leaders(id) ON DELETE CASCADE,
  birth_date date,
  age integer,
  gender text CHECK (gender IN ('M', 'F')),
  phone text,
  address text,
  department text,
  guardian_name text,
  guardian_phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read campers"
  ON campers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert campers"
  ON campers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update campers"
  ON campers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete campers"
  ON campers
  FOR DELETE
  TO authenticated
  USING (true);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (true);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Tracking entries table
CREATE TABLE IF NOT EXISTS tracking_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  camper_id uuid REFERENCES campers(id) ON DELETE CASCADE,
  decision text CHECK (decision IN ('accepted', 'reconciled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracking_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read tracking_entries"
  ON tracking_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert tracking_entries"
  ON tracking_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tracking_entries"
  ON tracking_entries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete tracking_entries"
  ON tracking_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  file_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (true);