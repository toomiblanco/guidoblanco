-- ================================================================
-- SETUP COMPLETO DE BASE DE DATOS - GUIDOBLANCO
-- ================================================================
-- Este archivo contiene TODO lo necesario para configurar
-- la base de datos desde cero.
--
-- Ejecutar como usuario postgres:
-- sudo -u postgres psql < setup-database-completo.sql
-- ================================================================

-- ================================================================
-- 1. CREAR USUARIO Y BASE DE DATOS
-- ================================================================

-- Terminar conexiones activas (si la BD ya existe)
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'guidoblanco_db'
  AND pid <> pg_backend_pid();

-- Eliminar BD existente (CUIDADO: esto borra todo)
DROP DATABASE IF EXISTS guidoblanco_db;

-- Eliminar usuario existente
DROP USER IF EXISTS guidoblanco_user;

-- Crear usuario
CREATE USER guidoblanco_user WITH PASSWORD 'Tomi39917314!';

-- Crear base de datos
CREATE DATABASE guidoblanco_db OWNER guidoblanco_user;

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE guidoblanco_db TO guidoblanco_user;

-- Conectar a la base de datos
\c guidoblanco_db

-- Dar permisos en el schema public
GRANT ALL ON SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO guidoblanco_user;

-- Configurar permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO guidoblanco_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO guidoblanco_user;

-- ================================================================
-- 2. CREAR EXTENSIÓN UUID
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 3. CREAR TABLAS
-- ================================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de artículos
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación artículos-tags
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ================================================================
-- 4. CREAR ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ================================================================
-- 5. CREAR FUNCIONES Y TRIGGERS
-- ================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 6. INSERTAR DATOS DE EJEMPLO
-- ================================================================

-- Categorías principales
INSERT INTO categories (name, slug, description) VALUES
('Política', 'politica', 'Análisis y noticias del ámbito político argentino'),
('Economía', 'economia', 'Cobertura económica y análisis financiero'),
('Sociedad', 'sociedad', 'Temas sociales y de actualidad'),
('Internacional', 'internacional', 'Noticias y análisis internacionales')
ON CONFLICT (slug) DO NOTHING;

-- Subcategorías
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Elecciones', 'elecciones', 'Cobertura electoral y análisis', (SELECT id FROM categories WHERE slug = 'politica')),
('Mercados', 'mercados', 'Análisis de mercados financieros', (SELECT id FROM categories WHERE slug = 'economia')),
('Educación', 'educacion', 'Temas educativos y universitarios', (SELECT id FROM categories WHERE slug = 'sociedad'))
ON CONFLICT (slug) DO NOTHING;

-- Tags comunes
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

-- ================================================================
-- 7. CREAR USUARIOS ADMINISTRADORES
-- ================================================================

-- Hash de la contraseña "admin123" (bcrypt con salt 10)
-- Contraseña: admin123

INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('admin@guidoblanco.com', '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W',
  is_admin = true,
  full_name = 'Guido Blanco',
  email_verified = true;

INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('guidoblanco@gmail.com', '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W',
  is_admin = true,
  full_name = 'Guido Blanco',
  email_verified = true;

-- ================================================================
-- 8. VERIFICACIÓN
-- ================================================================

-- Mostrar resumen
SELECT 'SETUP COMPLETADO!' as status;
SELECT '' as separator;

SELECT 'Tablas creadas:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT '' as separator;

SELECT 'Usuarios admin:' as info;
SELECT email, full_name, is_admin, created_at FROM users WHERE is_admin = true;
SELECT '' as separator;

SELECT 'Categorías:' as info;
SELECT name, slug FROM categories ORDER BY created_at;
SELECT '' as separator;

SELECT 'Tags:' as info;
SELECT name, slug FROM tags ORDER BY created_at LIMIT 5;
SELECT '' as separator;

SELECT 'Estadísticas:' as info;
SELECT
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM categories) as categorias,
  (SELECT COUNT(*) FROM tags) as tags,
  (SELECT COUNT(*) FROM articles) as articulos;

-- ================================================================
-- FIN DEL SETUP
-- ================================================================
