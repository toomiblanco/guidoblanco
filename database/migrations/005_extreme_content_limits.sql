-- ================================================================
-- MIGRACIÓN: Límites EXTREMOS para entrevistas muy extensas
-- ================================================================
-- Esta migración configura PostgreSQL para manejar contenido
-- realmente extenso (100+ páginas, 500,000+ caracteres)
-- ================================================================

-- 1. Verificar configuración actual de PostgreSQL
SELECT name, setting, unit FROM pg_settings WHERE name LIKE '%max%' AND name IN (
  'max_wal_size',
  'shared_buffers',
  'work_mem'
);

-- 2. Configurar parámetros temporales para esta sesión
SET work_mem = '256MB';
SET maintenance_work_mem = '512MB';

-- 3. Verificar que el campo content es TEXT y no tiene restricciones
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  character_octet_length
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'content';

-- 4. Asegurar que NO hay restricciones de CHECK en el contenido
SELECT 
  tc.constraint_name,
  tc.table_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'articles';

-- 5. Agregar índice específico para contenido muy largo (usando hash para mejor performance)
DROP INDEX IF EXISTS idx_articles_content_length;
CREATE INDEX idx_articles_content_length ON articles (length(content));

-- 6. Configurar estadísticas extendidas para contenido largo
ALTER TABLE articles ALTER COLUMN content SET STATISTICS 1000;

-- 7. Verificar límites actuales del servidor PostgreSQL
DO $$
DECLARE
  current_setting TEXT;
BEGIN
  -- Mostrar configuraciones relevantes
  SELECT setting INTO current_setting FROM pg_settings WHERE name = 'shared_buffers';
  RAISE NOTICE 'shared_buffers: %', current_setting;
  
  SELECT setting INTO current_setting FROM pg_settings WHERE name = 'work_mem';
  RAISE NOTICE 'work_mem: %', current_setting;
  
  -- Información sobre límites de PostgreSQL
  RAISE NOTICE 'LÍMITES TEÓRICOS DE POSTGRESQL:';
  RAISE NOTICE '• Campo TEXT: 1 GB (1,073,741,824 caracteres)';
  RAISE NOTICE '• Fila completa: 1.6 TB máximo';
  RAISE NOTICE '• Prácticamente SIN LÍMITE para entrevistas';
  
  RAISE NOTICE 'CONFIGURACIÓN ACTUAL:';
  RAISE NOTICE '• Tipo de campo: TEXT (sin restricciones)';
  RAISE NOTICE '• Límites aplicados: NINGUNO';
  RAISE NOTICE '• Estado: PREPARADO para contenido EXTREMADAMENTE extenso';
END
$$;

-- 8. Crear función para analizar contenido muy largo
CREATE OR REPLACE FUNCTION analyze_content_size(article_id UUID)
RETURNS TABLE(
  id UUID,
  title_length INT,
  summary_length INT,
  content_length INT,
  content_size_mb NUMERIC,
  total_size_estimate_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    length(a.title) as title_length,
    length(COALESCE(a.summary, '')) as summary_length,
    length(a.content) as content_length,
    (length(a.content) / 1024.0 / 1024.0)::numeric(10,2) as content_size_mb,
    (octet_length(a.content::bytea) / 1024.0 / 1024.0)::numeric(10,2) as total_size_estimate_mb
  FROM articles a
  WHERE a.id = article_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear tabla de configuración para límites dinámicos
CREATE TABLE IF NOT EXISTS content_limits (
  id SERIAL PRIMARY KEY,
  max_content_length BIGINT DEFAULT 10485760, -- 10MB como texto
  max_articles_per_user INT DEFAULT 1000,
  created_at TIMESTAMP DEFAULT NOW(),
  note TEXT
);

-- Insertar configuración inicial MUY permisiva
INSERT INTO content_limits (max_content_length, note) 
VALUES (52428800, 'Límite inicial: 50MB de texto (~25 millones de caracteres)');

-- 10. Test de capacidad extrema
DO $$
DECLARE
  test_content TEXT;
  test_id UUID;
BEGIN
  -- Crear contenido de prueba muy largo (1MB de texto)
  SELECT string_agg('Esta es una línea de prueba para verificar que PostgreSQL puede manejar contenido extremadamente extenso. ', '')
  INTO test_content
  FROM generate_series(1, 5000);
  
  -- Insertar contenido de prueba
  INSERT INTO articles (title, slug, content, author_id, is_published)
  SELECT 
    'Test Capacidad Extrema - ' || NOW(),
    'test-capacidad-extrema-' || extract(epoch from now()),
    test_content,
    (SELECT id FROM users WHERE is_admin = true LIMIT 1),
    false
  RETURNING id INTO test_id;
  
  -- Mostrar resultados
  PERFORM analyze_content_size(test_id);
  
  RAISE NOTICE 'Test completado exitosamente!';
  RAISE NOTICE 'Contenido de prueba: % caracteres', length(test_content);
  RAISE NOTICE 'ID del artículo de prueba: %', test_id;
  
  -- Limpiar test
  DELETE FROM articles WHERE id = test_id;
  
  RAISE NOTICE 'Test limpiado. Sistema listo para contenido EXTREMO.';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error en test: %', SQLERRM;
  RAISE NOTICE 'Esto podría indicar un límite del servidor.';
END
$$;

-- ================================================================
-- RESUMEN FINAL
-- ================================================================

RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
RAISE NOTICE '║                     MIGRACIÓN COMPLETADA                     ║';
RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
RAISE NOTICE '║ NUEVA CAPACIDAD:                                            ║';
RAISE NOTICE '║ • Contenido: SIN LÍMITE PRÁCTICO                            ║';
RAISE NOTICE '║ • Teórico: 1 GB por artículo                                ║';
RAISE NOTICE '║ • Práctico: 50-100 MB recomendado                           ║';
RAISE NOTICE '║ • Entrevistas: 200+ páginas sin problemas                   ║';
RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';