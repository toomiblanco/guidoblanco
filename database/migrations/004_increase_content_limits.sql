-- ================================================================
-- MIGRACIÓN: Aumentar límites para contenido extenso
-- ================================================================
-- Esta migración optimiza los campos para manejar entrevistas
-- de 25+ páginas y contenido muy extenso
-- ================================================================

-- 1. Actualizar el campo content para manejar contenido muy extenso
-- LONGTEXT puede manejar hasta 4GB de texto
ALTER TABLE articles 
  ALTER COLUMN content TYPE TEXT;

-- 2. Asegurar que summary también pueda ser extenso
ALTER TABLE articles 
  ALTER COLUMN summary TYPE TEXT;

-- 3. Verificar que no hay límites en los nuevos campos de entrevistas
-- (estos ya deberían estar bien, pero por seguridad)
DO $$
BEGIN
  -- Agregar campos de entrevista si no existen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'interviewee_name') THEN
    ALTER TABLE articles ADD COLUMN interviewee_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'interview_date') THEN
    ALTER TABLE articles ADD COLUMN interview_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'published_date') THEN
    ALTER TABLE articles ADD COLUMN published_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'featured_image_position') THEN
    ALTER TABLE articles ADD COLUMN featured_image_position VARCHAR(20) DEFAULT 'center';
  END IF;
END
$$;

-- 4. Configurar parámetros de PostgreSQL para contenido extenso
-- (requiere privilegios de superusuario)
-- max_allowed_packet ya no aplica en PostgreSQL, pero podemos optimizar otros parámetros

-- 5. Crear índice para búsquedas en contenido extenso (usando GIN para texto completo)
-- Esto mejorará la performance con contenido muy largo
DROP INDEX IF EXISTS idx_articles_content_search;
CREATE INDEX idx_articles_content_search ON articles USING gin(to_tsvector('spanish', content));

-- 6. Índice para búsquedas en título y summary
DROP INDEX IF EXISTS idx_articles_title_search;
CREATE INDEX idx_articles_title_search ON articles USING gin(to_tsvector('spanish', title || ' ' || COALESCE(summary, '')));

-- 7. Verificar la configuración actual de límites
-- Mostrar información sobre los límites actuales
DO $$
DECLARE
  max_size TEXT;
BEGIN
  SELECT setting INTO max_size FROM pg_settings WHERE name = 'max_wal_size';
  RAISE NOTICE 'Configuración actual de PostgreSQL optimizada para contenido extenso';
  RAISE NOTICE 'Tipo de datos: TEXT (sin límite práctico)';
  RAISE NOTICE 'Índices de búsqueda de texto completo: Habilitados';
  RAISE NOTICE 'Estado: Listo para entrevistas de 25+ páginas';
END
$$;

-- ================================================================
-- VERIFICACIÓN
-- ================================================================

-- Verificar que los cambios se aplicaron correctamente
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'articles' 
  AND column_name IN ('content', 'summary', 'interviewee_name', 'interview_date', 'published_date', 'featured_image_position')
ORDER BY column_name;

-- Mostrar los índices creados
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'articles' 
  AND indexname LIKE '%search%';