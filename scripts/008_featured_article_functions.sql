-- Add trigger to ensure only one featured article at a time
CREATE OR REPLACE FUNCTION ensure_single_featured_article()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new or updated article is being set as featured
  IF NEW.is_featured = TRUE THEN
    -- Set all other articles as not featured
    UPDATE public.articles 
    SET is_featured = FALSE 
    WHERE id != NEW.id AND is_featured = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for insert and update operations
DROP TRIGGER IF EXISTS trigger_ensure_single_featured ON public.articles;
CREATE TRIGGER trigger_ensure_single_featured
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_featured_article();

-- Function to get featured article with category
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
  FROM public.articles a
  LEFT JOIN public.categories c ON a.category_id = c.id
  WHERE a.is_featured = TRUE 
    AND a.is_published = TRUE
  ORDER BY a.published_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest articles (excluding featured one)
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
  FROM public.articles a
  LEFT JOIN public.categories c ON a.category_id = c.id
  WHERE a.is_published = TRUE 
    AND a.is_featured = FALSE
  ORDER BY a.published_at DESC
  LIMIT article_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get article by slug for social media meta tags
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
    p.full_name as author_name,
    a.published_at,
    a.created_at,
    a.updated_at
  FROM public.articles a
  LEFT JOIN public.categories c ON a.category_id = c.id
  LEFT JOIN public.profiles p ON a.author_id = p.id
  WHERE a.slug = article_slug 
    AND a.is_published = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;