/*
  # Fix authentication redirect URLs

  1. Changes
    - Set the base URL for all auth operations
    - Configure password reset redirect URL
    - Set up email confirmation redirect URL

  2. Security
    - No security changes, only configuration updates
*/

DO $$ 
BEGIN
  -- Set the base URL for the site
  PERFORM set_config('auth.site_url', 'https://infocards.gyrelabs.org', true);
  
  -- Configure specific redirect URLs for auth operations
  PERFORM set_config('auth.email.redirect_url', 'https://infocards.gyrelabs.org', true);
  PERFORM set_config('auth.email.reset_password_redirect_url', 'https://infocards.gyrelabs.org/reset-password', true);
  PERFORM set_config('auth.email.confirmation_redirect_url', 'https://infocards.gyrelabs.org/auth/confirm', true);
END $$;