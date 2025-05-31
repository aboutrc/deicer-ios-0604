/*
  # Update SMTP Configuration
  
  Updates the SMTP configuration with additional settings and proper SSL/TLS configuration
*/

DO $$ 
BEGIN
  -- Basic SMTP Configuration
  PERFORM set_config('auth.smtp.host', 'smtp.gmail.com', true);
  PERFORM set_config('auth.smtp.port', '587', true);
  PERFORM set_config('auth.smtp.user', 'aboutrc@gmail.com', true);
  PERFORM set_config('auth.smtp.pass', 'ssnk skrr jpwn aalr', true);
  PERFORM set_config('auth.smtp.sender_name', 'Info Cards CMS', true);
  PERFORM set_config('auth.smtp.sender_email', 'aboutrc@gmail.com', true);
  
  -- Additional SMTP Settings
  PERFORM set_config('auth.smtp.secure', 'true', true);
  PERFORM set_config('auth.smtp.max_retries', '3', true);
  PERFORM set_config('auth.smtp.admin_email', 'aboutrc@gmail.com', true);
  
  -- Enable TLS explicitly
  PERFORM set_config('auth.smtp.tls.enabled', 'true', true);
  PERFORM set_config('auth.smtp.tls.min_version', 'TLSv1.2', true);
  
  -- Set email template configuration
  PERFORM set_config('auth.email.template_fetch_url', '', true);
  PERFORM set_config('auth.email.enable_confirmations', 'true', true);
  
  -- Ensure proper redirect URLs
  PERFORM set_config('auth.email.redirect_url', 'https://infocards.gyrelabs.org', true);
  PERFORM set_config('auth.email.reset_password_redirect_url', 'https://infocards.gyrelabs.org/reset-password', true);
  PERFORM set_config('auth.email.confirmation_redirect_url', 'https://infocards.gyrelabs.org/auth/confirm', true);
END $$;