/*
  # Update site URLs for authentication

  Updates all authentication-related URLs to use the production domain.
  
  1. Changes
    - Sets the base site URL
    - Updates all auth redirect URLs
    - Configures magic link URLs
*/

DO $$ 
BEGIN
  -- Set the base site URL
  PERFORM set_config('auth.site_url', 'https://infocards.gyrelabs.org', true);
  
  -- Configure magic link URLs
  PERFORM set_config('auth.email.redirect_url', 'https://infocards.gyrelabs.org', true);
  PERFORM set_config('auth.email.reset_password_redirect_url', 'https://infocards.gyrelabs.org/reset-password', true);
  PERFORM set_config('auth.email.confirmation_redirect_url', 'https://infocards.gyrelabs.org/auth/confirm', true);
  PERFORM set_config('auth.email.magic_link_redirect_url', 'https://infocards.gyrelabs.org', true);
  
  -- Set additional auth settings
  PERFORM set_config('auth.email.enable_confirmations', 'false', true);
  PERFORM set_config('auth.email.double_confirm_changes', 'false', true);
  PERFORM set_config('auth.email.enable_signup', 'false', true);
END $$;