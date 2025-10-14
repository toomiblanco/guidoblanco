-- Funciones útiles para la aplicación

-- Función para obtener artículo destacado
CREATE OR REPLACE FUNCTION get_featured_article()
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  summary TEXT,
  cover_image_url TEXT,
  category_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.slug,
    a.summary,
    a.cover_image_url,
    c.name as category_name,
    a.published_at,
    a.created_at
  FROM articles a
  LEFT JOIN categories c ON a.category_id = c.id
  WHERE a.is_published = true AND a.is_featured = true
  ORDER BY a.published_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener últimos artículos
CREATE OR REPLACE FUNCTION get_latest_articles(article_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  summary TEXT,
  cover_image_url TEXT,
  category_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.slug,
    a.summary,
    a.cover_image_url,
    c.name as category_name,
    a.published_at,
    a.created_at
  FROM articles a
  LEFT JOIN categories c ON a.category_id = c.id
  WHERE a.is_published = true
  ORDER BY a.published_at DESC
  LIMIT article_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener artículo por slug
CREATE OR REPLACE FUNCTION get_article_by_slug(article_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  summary TEXT,
  content TEXT,
  cover_image_url TEXT,
  category_name TEXT,
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.slug,
    a.summary,
    a.content,
    a.cover_image_url,
    c.name as category_name,
    u.full_name as author_name,
    a.published_at,
    a.created_at,
    a.updated_at
  FROM articles a
  LEFT JOIN categories c ON a.category_id = c.id
  LEFT JOIN users u ON a.author_id = u.id
  WHERE a.slug = article_slug AND a.is_published = true;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION check_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT is_admin INTO is_admin_user
  FROM users
  WHERE email = user_email;
  
  RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql;