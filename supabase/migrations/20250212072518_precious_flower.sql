/*
  # Add auth policies and functions for user management
  
  1. Security Changes
    - Add function to create auth users for leaders
    - Add trigger to automatically create auth users for new leaders
    - Add policies for auth management
*/

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create auth user for a leader
CREATE OR REPLACE FUNCTION create_auth_user_for_leader()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Generate a UUID for the new user
  _user_id := gen_random_uuid();
  
  -- Insert into auth.users with the generated UUID
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    aud,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    _user_id,
    '00000000-0000-0000-0000-000000000000',
    LOWER(REPLACE(NEW.name, ' ', '.')) || '@camp.local',
    crypt('camp123', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    now(),
    now(),
    now()
  );

  -- Insert default role with provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    _user_id,
    _user_id,
    _user_id::text,
    jsonb_build_object(
      'sub', _user_id,
      'email', LOWER(REPLACE(NEW.name, ' ', '.')) || '@camp.local'
    ),
    'email',
    now(),
    now(),
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS create_auth_user_trigger ON leaders;

-- Create trigger for new leaders
CREATE TRIGGER create_auth_user_trigger
  AFTER INSERT ON leaders
  FOR EACH ROW
  EXECUTE FUNCTION create_auth_user_for_leader();

-- Create admin user
DO $$
DECLARE
  _admin_id uuid := gen_random_uuid();
BEGIN
  -- Only create admin if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@camp.local') THEN
    -- Insert admin user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      aud,
      created_at,
      updated_at,
      last_sign_in_at
    )
    VALUES (
      _admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@camp.local',
      crypt('admin123', gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated',
      now(),
      now(),
      now()
    );

    -- Insert admin identity with provider_id
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      last_sign_in_at
    )
    VALUES (
      _admin_id,
      _admin_id,
      _admin_id::text,
      jsonb_build_object(
        'sub', _admin_id,
        'email', 'admin@camp.local'
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;