import { createClient } from './server'

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
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .rpc('get_featured_article')
      
    if (error) {
      console.error('Error fetching featured article:', error)
      return null
    }
    
    return data?.[0] || null
  } catch (error) {
    console.error('Error fetching featured article:', error)
    return null
  }
}

export async function getLatestArticles(limit: number = 6): Promise<Article[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .rpc('get_latest_articles', { article_limit: limit })
      
    if (error) {
      console.error('Error fetching latest articles:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching latest articles:', error)
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

export async function getArticleBySlug(slug: string): Promise<FullArticle | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .rpc('get_article_by_slug', { article_slug: slug })
      
    if (error) {
      console.error('Error fetching article by slug:', error)
      return null
    }
    
    return data?.[0] || null
  } catch (error) {
    console.error('Error fetching article by slug:', error)
    return null
  }
}