-- Script para crear/actualizar el usuario administrador específico
-- Email: guidomblanco@gmail.com

-- Primero verificamos si el usuario existe en auth.users
SELECT id, email FROM auth.users WHERE email = 'guidomblanco@gmail.com';

-- Si el usuario existe, actualizar su perfil para ser admin
UPDATE public.profiles 
SET is_admin = true, full_name = 'Guido Blanco'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'guidomblanco@gmail.com' 
  LIMIT 1
);

-- Si el perfil no existe, crearlo (esto debería ejecutarse automáticamente por el trigger, pero por si acaso)
INSERT INTO public.profiles (id, full_name, is_admin)
SELECT id, 'Guido Blanco', true
FROM auth.users 
WHERE email = 'guidomblanco@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.users.id
  );

-- Verificar que el usuario ahora es admin
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'guidomblanco@gmail.com';
