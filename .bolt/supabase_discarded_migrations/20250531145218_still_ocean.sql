/*
  # Update SMTP Configuration to use port 465
  
  Changes:
  - Changes SMTP port from 587 to 465 for SSL/TLS
  - Explicitly sets secure connection parameters
  - Maintains existing email and password configuration
*/

DO $$ 
BEGIN
  -- Basic SMTP Configuration
  PERFORM set_config('auth.smtp.host', 'smtp.gmail.com', true);
  PERFORM set_config('auth.smtp.port', '465', true);  -- Changed from 587 to 465
  PERFORM set_config('auth.smtp.user', 'aboutrc@gmail.com', true);
  PERFORM set_config('auth.smtp.pass', 'ssnk skrr jpwn aalr', true);
  PERFORM set_config('auth.smtp.sender_name', 'Info Cards CMS', true);
  PERFORM set_config('auth.smtp.sender_email', 'aboutrc@gmail.com', true);
  
  -- Force SSL/TLS settings
  PERFORM set_config('auth.smtp.secure', 'true', true);
  PERFORM set_config('auth.smtp.tls.enabled', 'true', true);
  PERFORM set_config('auth.smtp.tls.min_version', 'TLSv1.2', true);
  
  -- Email template and redirect configuration
  PERFORM set_config('auth.email.enable_confirmations', 'false', true);
  PERFORM set_config('auth.email.redirect_url', 'https://infocards.gyrelabs.org', true);
  PERFORM set_config('auth.email.reset_password_redirect_url', 'https://infocards.gyrelabs.org/reset-password', true);
END $$;