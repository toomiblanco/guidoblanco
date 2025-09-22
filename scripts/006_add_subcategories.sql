-- Agregar soporte para subcategorías
-- Agregamos una columna parent_id para crear la relación jerárquica

ALTER TABLE public.categories 
ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Crear índice para mejorar el rendimiento de consultas jerárquicas
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Función para obtener todas las categorías con sus subcategorías
CREATE OR REPLACE FUNCTION get_categories_with_subcategories()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  parent_id uuid,
  parent_name text,
  level integer,
  created_at timestamptz,
  updated_at timestamptz
) LANGUAGE sql AS $$
  WITH RECURSIVE category_tree AS (
    -- Categorías raíz (sin parent_id)
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.parent_id,
      ''::text as parent_name,
      0 as level,
      c.created_at,
      c.updated_at
    FROM public.categories c
    WHERE c.parent_id IS NULL
    
    UNION ALL
    
    -- Subcategorías
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.parent_id,
      ct.name as parent_name,
      ct.level + 1,
      c.created_at,
      c.updated_at
    FROM public.categories c
    JOIN category_tree ct ON c.parent_id = ct.id
  )
  SELECT * FROM category_tree ORDER BY level, name;
$$;

-- Función para obtener el path completo de una categoría
CREATE OR REPLACE FUNCTION get_category_path(category_id uuid)
RETURNS text LANGUAGE sql AS $$
  WITH RECURSIVE category_path AS (
    SELECT 
      id,
      name,
      parent_id,
      name as path
    FROM public.categories
    WHERE id = category_id
    
    UNION ALL
    
    SELECT 
      c.id,
      c.name,
      c.parent_id,
      c.name || ' > ' || cp.path
    FROM public.categories c
    JOIN category_path cp ON cp.parent_id = c.id
  )
  SELECT path FROM category_path WHERE parent_id IS NULL;
$$;

-- Agregar restricción para prevenir bucles infinitos (una categoría no puede ser su propio ancestro)
CREATE OR REPLACE FUNCTION check_category_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  found_cycle BOOLEAN := FALSE;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Verificar que no se cree un bucle
    WITH RECURSIVE parent_check AS (
      SELECT id, parent_id, 1 as level
      FROM public.categories
      WHERE id = NEW.parent_id
      
      UNION ALL
      
      SELECT c.id, c.parent_id, pc.level + 1
      FROM public.categories c
      JOIN parent_check pc ON c.id = pc.parent_id
      WHERE pc.level < 10 -- Límite de profundidad para prevenir bucles infinitos
    )
    SELECT EXISTS (SELECT 1 FROM parent_check WHERE id = NEW.id) INTO found_cycle;
    
    IF found_cycle THEN
      RAISE EXCEPTION 'No se puede crear una jerarquía circular de categorías';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
CREATE TRIGGER category_hierarchy_check
  BEFORE INSERT OR UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION check_category_hierarchy();

-- Actualizar las políticas RLS para incluir la nueva estructura
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;

-- Recrear las políticas
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );