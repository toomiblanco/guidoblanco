-- Create an admin user (you'll need to update this with actual credentials)
-- This is just a template - in production, create the admin user through the auth interface

-- First, you need to sign up a user through the Supabase auth system
-- Then update their profile to be an admin

-- Example of updating a user to be admin (replace the email with the actual admin email)
UPDATE public.profiles 
SET is_admin = true, full_name = 'Guido Blanco'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@guidoblanco.com' 
  LIMIT 1
);

-- If the profile doesn't exist, you can create it manually:
-- INSERT INTO public.profiles (id, full_name, is_admin)
-- SELECT id, 'Guido Blanco', true
-- FROM auth.users 
-- WHERE email = 'admin@guidoblanco.com'
-- ON CONFLICT (id) DO UPDATE SET is_admin = true, full_name = 'Guido Blanco';
