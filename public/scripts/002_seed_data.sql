-- Datos de ejemplo para desarrollo y testing
-- Este script crea categorías, tags y un usuario administrador

-- Insertar categorías principales
INSERT INTO public.categories (name, slug, description) VALUES
('Política', 'politica', 'Análisis y noticias del ámbito político argentino'),
('Economía', 'economia', 'Cobertura económica y análisis financiero'),
('Sociedad', 'sociedad', 'Temas sociales y de actualidad'),
('Internacional', 'internacional', 'Noticias y análisis internacionales')
ON CONFLICT (slug) DO NOTHING;

-- Insertar tags comunes
INSERT INTO public.tags (name, slug) VALUES
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
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO public.users (email, password_hash, full_name, is_admin, email_verified) VALUES
('admin@guidoblanco.com', '$2a$10$rOJ8SB2D1FYh9CZT2xQo/uH5t.RY5nJh.QBfOcJ9xJ5CaLNyNHvBm', 'Guido Blanco', true, true)
ON CONFLICT (email) DO NOTHING;

-- Crear perfil correspondiente
INSERT INTO public.profiles (id, full_name, is_admin) 
SELECT id, full_name, is_admin FROM public.users WHERE email = 'admin@guidoblanco.com'
ON CONFLICT (id) DO NOTHING;
