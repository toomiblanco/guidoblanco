-- Datos de ejemplo para desarrollo y testing
-- Este script crea categorías, tags y artículos de ejemplo

-- Insertar categorías principales
INSERT INTO categories (name, slug, description) VALUES
('Política', 'politica', 'Análisis y noticias del ámbito político argentino'),
('Economía', 'economia', 'Cobertura económica y análisis financiero'),
('Sociedad', 'sociedad', 'Temas sociales y de actualidad'),
('Internacional', 'internacional', 'Noticias y análisis internacionales')
ON CONFLICT (slug) DO NOTHING;

-- Insertar subcategorías
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Elecciones', 'elecciones', 'Cobertura electoral y análisis', (SELECT id FROM categories WHERE slug = 'politica')),
('Mercados', 'mercados', 'Análisis de mercados financieros', (SELECT id FROM categories WHERE slug = 'economia')),
('Educación', 'educacion', 'Temas educativos y universitarios', (SELECT id FROM categories WHERE slug = 'sociedad'))
ON CONFLICT (slug) DO NOTHING;

-- Insertar tags comunes
INSERT INTO tags (name, slug) VALUES
('Análisis', 'analisis'),
('Investigación', 'investigacion'),
('Entrevista', 'entrevista'),
('Opinión', 'opinion'),
('Actualidad', 'actualidad'),
('Argentina', 'argentina'),
('Buenos Aires', 'buenos-aires'),
('Congreso', 'congreso'),
('Economía', 'economia-tag'),
('Política', 'politica-tag')
ON CONFLICT (slug) DO NOTHING;

-- Crear usuario administrador
INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('admin@guidoblanco.com', '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO NOTHING;