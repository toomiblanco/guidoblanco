import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { ArticleContent } from "@/components/article-content"
import { RelatedArticles } from "@/components/related-articles"
import { notFound } from "next/navigation"
import { getArticleBySlug } from "@/lib/supabase/articles"
import { generateArticleMetadata } from "@/lib/supabase/metadata"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  
  if (!article) {
    return {
      title: 'Artículo no encontrado | Guido Blanco',
      description: 'El artículo que buscas no existe o ha sido eliminado.',
    }
  }
  
  return generateArticleMetadata(article)
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch the article
  const { data: article } = await supabase
    .from("articles")
    .select(`
      *,
      categories (
        id,
        name,
        slug
      ),
      article_tags (
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!article) {
    notFound()
  }

  // Fetch related articles (same category, excluding current)
  const { data: relatedArticles } = await supabase
    .from("articles")
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("category_id", article.category_id)
    .eq("is_published", true)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3)

  // Fetch random articles for sidebar (excluding current article)
  // Usar una consulta más simple primero para debuggear
  const { data: randomArticles, error: randomError } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      cover_image_url,
      slug,
      published_at,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("is_published", true)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(20) // Obtener más para luego seleccionar aleatoriamente

  // Debug: Ver si hay errores en la consulta
  if (randomError) {
    console.error("Error fetching random articles:", randomError)
  }

  // Transformar datos para que coincidan con el tipo esperado
  const transformedArticles = randomArticles?.map(article => ({
    ...article,
    categories: Array.isArray(article.categories) ? article.categories[0] : article.categories
  })) || []
  
  // Seleccionar 4 artículos aleatorios de los más recientes
  const shuffledArticles = transformedArticles.sort(() => 0.5 - Math.random()).slice(0, 4)
  
  // Debug: Log para verificar cuántos artículos se obtuvieron
  console.log(`Current article ID: ${article.id}`)
  console.log(`Total published articles found: ${randomArticles?.length || 0}`)
  console.log(`Sidebar articles to show: ${shuffledArticles?.length || 0}`)
  console.log(`First sidebar article:`, shuffledArticles[0] || 'None')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ArticleContent article={article} sidebarArticles={shuffledArticles} />
        {relatedArticles && relatedArticles.length > 0 && <RelatedArticles articles={relatedArticles} />}
      </main>
    </div>
  )
}
