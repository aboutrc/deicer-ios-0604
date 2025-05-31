/*
  # Create admin user

  Creates a new user with email rc@aboutrc.com and specified password
*/

-- Create the user if it doesn't exist
DO $$ 
BEGIN
  -- First check if the user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'rc@aboutrc.com'
  ) THEN
    -- Insert the new user
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      'rc@aboutrc.com',
      crypt('Art!f!c!@l204!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      'authenticated'
    );
  ELSE
    -- Update password if user exists
    UPDATE auth.users 
    SET encrypted_password = crypt('Art!f!c!@l204!', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'rc@aboutrc.com';
  END IF;
END $$;