-- Script para corregir las políticas RLS que causan recursión infinita
-- Este problema ocurre cuando las políticas referencian la misma tabla que están protegiendo

-- Primero, eliminamos las políticas problemáticas
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Creamos nuevas políticas más simples que no causen recursión
-- Los usuarios pueden leer su propio perfil
CREATE POLICY "profiles_select_own_simple" ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil  
CREATE POLICY "profiles_update_own_simple" ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Política especial para que los admins puedan leer todos los perfiles
-- Esta usa una función auxiliar que no causa recursión
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Ahora creamos una política que permite a los admins leer todos los perfiles
-- usando la función auxiliar
CREATE POLICY "profiles_admin_read_all" ON public.profiles FOR SELECT 
  USING (public.is_admin_user());

-- También permitimos que los admins actualicen cualquier perfil
CREATE POLICY "profiles_admin_update_all" ON public.profiles FOR UPDATE 
  USING (public.is_admin_user());

-- Creamos una función RPC para verificar si un usuario es admin
-- Esta función se ejecuta con privilegios de seguridad definidos y evita los problemas de RLS
CREATE OR REPLACE FUNCTION public.check_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = user_id;
$$;

-- Verificamos las políticas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
