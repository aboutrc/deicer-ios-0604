/*
  # Update user password

  Updates the password for user rc@aboutrc.com to a new secure password.
*/

DO $$ 
BEGIN
  UPDATE auth.users 
  SET encrypted_password = crypt('Art!f!c!@l2024!', gen_salt('bf'))
  WHERE email = 'rc@aboutrc.com';
END $$;