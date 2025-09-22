-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Política', 'politica', 'Noticias y análisis político'),
  ('Economía', 'economia', 'Información económica y financiera'),
  ('Sociedad', 'sociedad', 'Temas sociales y culturales'),
  ('Deportes', 'deportes', 'Noticias deportivas'),
  ('Tecnología', 'tecnologia', 'Avances tecnológicos y digitales')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO public.tags (name, slug) VALUES
  ('Análisis', 'analisis'),
  ('Entrevista', 'entrevista'),
  ('Investigación', 'investigacion'),
  ('Opinión', 'opinion'),
  ('Breaking News', 'breaking-news'),
  ('Exclusiva', 'exclusiva')
ON CONFLICT (slug) DO NOTHING;
