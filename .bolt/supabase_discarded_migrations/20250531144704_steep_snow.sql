/*
  # Add SMTP Configuration
  
  Sets up email configuration for password reset functionality
  
  1. Changes
    - Configure SMTP settings for Gmail
    - Set sender name and email
    - Enable secure connection
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