import { query } from './connection'

// Tipos TypeScript
export interface Article {
  id: string
  title: string
  slug: string
  summary?: string
  content: string
  cover_image_url?: string
  is_featured: boolean
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
  category_id?: string
  author_id?: string
  category_name?: string
  author_name?: string
  tags?: Tag[]
  interviewee_name?: string
  interview_date?: string
  published_date?: string
  featured_image_position?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  created_at: string
  updated_at: string
  children?: Category[]
  parent?: Category
  level?: number
  full_path?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  password_hash: string
  full_name?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

// ARTICLES
export async function getAllArticles() {
  const result = await query(`
    SELECT a.*, c.name as category_name 
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.is_published = true
    ORDER BY a.published_at DESC, a.created_at DESC
  `)
  return result.rows
}

export async function getFeaturedArticle() {
  const result = await query(`
    SELECT a.*, c.name as category_name 
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.is_featured = true AND a.is_published = true
    ORDER BY a.published_at DESC, a.created_at DESC
    LIMIT 1
  `)
  return result.rows[0] || null
}

export async function getArticleBySlug(slug: string) {
  const result = await query(`
    SELECT a.*, c.name as category_name, c.slug as category_slug,
           CASE 
             WHEN COUNT(at.tag_id) = 0 THEN '[]'::json
             ELSE json_agg(DISTINCT jsonb_build_object('tag_id', at.tag_id, 'name', t.name, 'slug', t.slug))
           END as article_tags
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE a.slug = $1 AND a.is_published = true
    GROUP BY a.id, c.name, c.slug
  `, [slug])
  
  const article = result.rows[0] || null
  if (article) {
    // Asegurar que article_tags sea siempre un array
    article.article_tags = article.article_tags || []
  }
  return article
}

export async function getArticlesByCategory(
  categoryId: string, 
  options: { limit?: number; excludeId?: string } = {}
) {
  const { limit = 10, excludeId } = options
  let queryText = `
    SELECT a.*, c.name as category_name 
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.category_id = $1 AND a.is_published = true
  `
  const params = [categoryId]
  
  if (excludeId) {
    queryText += ' AND a.id != $2'
    params.push(excludeId)
    queryText += ` ORDER BY a.published_at DESC, a.created_at DESC LIMIT $3`
    params.push(limit.toString())
  } else {
    queryText += ` ORDER BY a.published_at DESC, a.created_at DESC LIMIT $2`
    params.push(limit.toString())
  }
  
  const result = await query(queryText, params)
  return result.rows
}

export async function getLatestArticles(limit: number = 6) {
  const result = await query(`
    SELECT a.*, c.name as category_name 
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.is_published = true AND a.is_featured = false
    ORDER BY a.published_at DESC, a.created_at DESC
    LIMIT $1
  `, [limit])
  return result.rows
}

// ADMIN - Articles
export async function getAllArticlesAdmin() {
  const result = await query(`
    SELECT a.id, a.title, a.slug, a.is_published, a.is_featured, 
           a.created_at, a.published_at, 
           json_build_object('name', c.name) as categories
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    ORDER BY a.created_at DESC
  `)
  return result.rows
}

export async function createArticle(
  article: Partial<Article>,
  tags: string[] = [],
  authorEmail?: string
) {
  // Si se proporciona authorEmail, buscar el ID del usuario
  let authorId = article.author_id

  if (authorEmail && !authorId) {
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [authorEmail]
    )
    authorId = userResult.rows[0]?.id
  }

  const result = await query(`
    INSERT INTO articles (title, slug, summary, content, cover_image_url, is_featured, is_published, category_id, published_at, author_id, interviewee_name, interview_date, published_date, featured_image_position)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `, [
    article.title,
    article.slug,
    article.summary || null,
    article.content,
    article.cover_image_url || null,
    article.is_featured || false,
    article.is_published || false,
    article.category_id || null,
    article.is_published ? new Date().toISOString() : null,
    authorId,
    article.interviewee_name || null,
    article.interview_date || null,
    article.published_date || null,
    article.featured_image_position || 'center'
  ])

  const newArticle = result.rows[0]

  // Agregar tags si existen
  if (tags.length > 0) {
    for (const tagId of tags) {
      await query(`
        INSERT INTO article_tags (article_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT (article_id, tag_id) DO NOTHING
      `, [newArticle.id, tagId])
    }
  }

  return newArticle
}

export async function getArticleById(id: string) {
  const result = await query(`
    SELECT a.*, c.name as category_name, c.slug as category_slug,
           array_agg(DISTINCT jsonb_build_object('tag_id', at.tag_id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE at.tag_id IS NOT NULL) as article_tags
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE a.id = $1
    GROUP BY a.id, c.name, c.slug
  `, [id])
  
  const article = result.rows[0]
  if (article) {
    // Asegurar que article_tags sea siempre un array
    article.article_tags = article.article_tags || []
  }
  
  return article || null
}

export async function deleteArticle(id: string) {
  // Primero eliminar las relaciones con tags
  await query('DELETE FROM article_tags WHERE article_id = $1', [id])
  // Luego eliminar el artículo
  const result = await query('DELETE FROM articles WHERE id = $1', [id])
  return (result.rowCount || 0) > 0
}

export async function updateArticle(id: string, article: Partial<Article>) {
  const result = await query(`
    UPDATE articles 
    SET title = $2, slug = $3, summary = $4, content = $5, cover_image_url = $6, 
        is_featured = $7, is_published = $8, category_id = $9, published_at = $10, 
        interviewee_name = $11, interview_date = $12, published_date = $13, 
        featured_image_position = $14, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [
    id,
    article.title,
    article.slug,
    article.summary,
    article.content,
    article.cover_image_url,
    article.is_featured,
    article.is_published,
    article.category_id,
    article.is_published ? (article.published_at || new Date().toISOString()) : null,
    article.interviewee_name || null,
    article.interview_date || null,
    article.published_date || null,
    article.featured_image_position || 'center'
  ])
  return result.rows[0]
}

// CATEGORIES
export async function getAllCategories() {
  const result = await query(`
    WITH RECURSIVE category_tree AS (
      -- Categorías padre (sin parent_id)
      SELECT 
        id, name, slug, description, parent_id, created_at, updated_at,
        0 as level,
        ARRAY[name] as path,
        name as full_path
      FROM categories 
      WHERE parent_id IS NULL
      
      UNION ALL
      
      -- Categorías hijas
      SELECT 
        c.id, c.name, c.slug, c.description, c.parent_id, c.created_at, c.updated_at,
        ct.level + 1,
        ct.path || c.name,
        ct.full_path || ' → ' || c.name
      FROM categories c
      INNER JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree 
    ORDER BY path
  `)
  return result.rows
}

export async function getCategoriesHierarchy() {
  const allCategories = await getAllCategories()
  const categoryMap = new Map<string, Category>()
  const rootCategories: Category[] = []

  // Crear mapa de categorías
  allCategories.forEach((cat: Category) => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  // Construir jerarquía
  allCategories.forEach((cat: Category) => {
    const category = categoryMap.get(cat.id)!
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(category)
        category.parent = parent
      }
    } else {
      rootCategories.push(category)
    }
  })

  return rootCategories
}

export async function createCategory(category: Partial<Category>) {
  const result = await query(`
    INSERT INTO categories (name, slug, description, parent_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [category.name, category.slug, category.description, category.parent_id || null])
  return result.rows[0]
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const result = await query(`
    UPDATE categories 
    SET name = $2, slug = $3, description = $4, parent_id = $5, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, category.name, category.slug, category.description, category.parent_id || null])
  return result.rows[0]
}

export async function deleteCategory(id: string) {
  await query('DELETE FROM categories WHERE id = $1', [id])
}

// TAGS
export async function getAllTags() {
  const result = await query('SELECT * FROM tags ORDER BY name ASC')
  return result.rows
}

export async function createTag(tag: Partial<Tag>) {
  const result = await query(`
    INSERT INTO tags (name, slug)
    VALUES ($1, $2)
    RETURNING *
  `, [tag.name, tag.slug])
  return result.rows[0]
}

export async function updateTag(id: string, tag: Partial<Tag>) {
  const result = await query(`
    UPDATE tags 
    SET name = $2, slug = $3, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, tag.name, tag.slug])
  return result.rows[0]
}

export async function deleteTag(id: string) {
  await query('DELETE FROM tags WHERE id = $1', [id])
}

// USERS/AUTH
export async function getUserByEmail(email: string) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function createUser(user: Partial<User>) {
  const result = await query(`
    INSERT INTO users (email, password_hash, full_name, is_admin)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, is_admin, created_at
  `, [user.email, user.password_hash, user.full_name, user.is_admin || false])
  return result.rows[0]
}

// Get interviewee names for hero section
export async function getIntervieweeNames() {
  const result = await query(`
    SELECT DISTINCT interviewee_name 
    FROM articles 
    WHERE interviewee_name IS NOT NULL 
      AND interviewee_name != '' 
      AND is_published = true
    ORDER BY interviewee_name ASC
  `)
  return result.rows.map(row => row.interviewee_name)
}