/*
  # Configure SMTP settings for password reset emails
  
  Sets up the SMTP configuration for sending password reset and other authentication emails
  through Gmail's SMTP server.
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