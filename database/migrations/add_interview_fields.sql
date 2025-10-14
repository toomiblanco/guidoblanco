-- ================================================================
-- MIGRACIÓN: AGREGAR CAMPOS PARA ENTREVISTAS Y GESTIÓN DE IMÁGENES
-- ================================================================
-- Fecha: 2025-10-10
-- Descripción: Agrega campos para gestión de entrevistas y posicionamiento de imágenes
-- ================================================================

-- Agregar nuevos campos a la tabla articles
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS interviewee_name TEXT,
ADD COLUMN IF NOT EXISTS interview_date DATE,
ADD COLUMN IF NOT EXISTS cover_image_position VARCHAR(20) DEFAULT 'center',
ADD COLUMN IF NOT EXISTS cover_image_crop_data JSONB;

-- Comentarios para documentar los campos
COMMENT ON COLUMN articles.interviewee_name IS 'Nombre del entrevistado o persona protagonista del artículo';
COMMENT ON COLUMN articles.interview_date IS 'Fecha en que se realizó la entrevista';
COMMENT ON COLUMN articles.cover_image_position IS 'Posición de la imagen de portada (center, top, bottom, left, right)';
COMMENT ON COLUMN articles.cover_image_crop_data IS 'Datos JSON del recorte de imagen (x, y, width, height, scale)';

-- Crear índice para búsquedas por fecha de entrevista
CREATE INDEX IF NOT EXISTS idx_articles_interview_date ON articles(interview_date);

-- Crear índice para búsquedas por entrevistado
CREATE INDEX IF NOT EXISTS idx_articles_interviewee ON articles(interviewee_name);

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('interviewee_name', 'interview_date', 'cover_image_position', 'cover_image_crop_data')
ORDER BY ordinal_position;