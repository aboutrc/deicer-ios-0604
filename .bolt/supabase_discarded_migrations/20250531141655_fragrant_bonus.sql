/*
  # Update site URL configuration
  
  Updates the Supabase site URL configuration to use the production URL instead of localhost
*/

DO $$ 
BEGIN
  -- Set the site URL to the production URL
  PERFORM set_config('auth.external.apple.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.azure.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.bitbucket.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.discord.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.facebook.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.github.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.gitlab.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.google.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.keycloak.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.linkedin.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.notion.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.spotify.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.slack.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.twitch.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.twitter.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.workos.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  PERFORM set_config('auth.external.zoom.redirect_uri', 'https://infocards.gyrelabs.org/auth/callback', true);
  
  -- Set the site URL
  PERFORM set_config('auth.site_url', 'https://infocards.gyrelabs.org', true);
END $$;