import { query } from '../database/connection'

export interface Article {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_image_url: string | null
  category_name: string | null
  published_at: string | null
  created_at: string
}

export interface FullArticle extends Article {
  content: string
  author_name: string | null
  updated_at: string
}

export async function getFeaturedArticle(): Promise<Article | null> {
  try {
    const result = await query('SELECT * FROM get_featured_article()')
    return result.rows[0] || null
  } catch (error) {
    console.error('Error fetching featured article:', error)
    return null
  }
}

export async function getLatestArticles(limit: number = 6): Promise<Article[]> {
  try {
    const result = await query('SELECT * FROM get_latest_articles($1)', [limit])
    return result.rows || []
  } catch (error) {
    console.error('Error fetching latest articles:', error)
    return []
  }
}

export async function getArticleBySlug(slug: string): Promise<FullArticle | null> {
  try {
    const result = await query('SELECT * FROM get_article_by_slug($1)', [slug])
    return result.rows[0] || null
  } catch (error) {
    console.error('Error fetching article by slug:', error)
    return null
  }
}

export async function getArticlesByCategory(categoryId: string, excludeId?: string, limit: number = 3): Promise<Article[]> {
  try {
    let queryText = `
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
      WHERE a.category_id = $1 AND a.is_published = true
    `
    const params = [categoryId]
    
    if (excludeId) {
      queryText += ' AND a.id != $2'
      params.push(excludeId)
      queryText += ' ORDER BY a.published_at DESC LIMIT $3'
      params.push(limit.toString())
    } else {
      queryText += ' ORDER BY a.published_at DESC LIMIT $2'
      params.push(limit.toString())
    }
    
    const result = await query(queryText, params)
    return result.rows || []
  } catch (error) {
    console.error('Error fetching articles by category:', error)
    return []
  }
}

export async function getAllArticles(): Promise<Article[]> {
  try {
    const result = await query(`
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.summary,
        a.cover_image_url,
        c.name as category_name,
        a.published_at,
        a.created_at,
        a.is_published,
        a.is_featured
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `)
    return result.rows || []
  } catch (error) {
    console.error('Error fetching all articles:', error)
    return []
  }
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}