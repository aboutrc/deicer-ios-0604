/*
  # Configure SMTP Settings
  
  Sets up SMTP configuration for Gmail integration with the following:
  - SMTP host and port for Gmail
  - Authentication credentials
  - Sender information
  - TLS security settings
*/

DO $$ 
BEGIN
  -- Set SMTP configuration
  PERFORM set_config('auth.smtp.host', 'smtp.gmail.com', true);
  PERFORM set_config('auth.smtp.port', '587', true);
  PERFORM set_config('auth.smtp.user', 'aboutrc@gmail.com', true);
  PERFORM set_config('auth.smtp.pass', 'ssnk skrr jpwn aalr', true);
  PERFORM set_config('auth.smtp.sender_name', 'Info Cards CMS', true);
  PERFORM set_config('auth.smtp.sender_email', 'aboutrc@gmail.com', true);
  PERFORM set_config('auth.smtp.secure', 'true', true);
END $$;