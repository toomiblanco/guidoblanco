import { Header } from "@/components/header"
import { ArticleContent } from "@/components/article-content"
import { RelatedArticles } from "@/components/related-articles"
import { notFound } from "next/navigation"
import { getArticleBySlug, getArticlesByCategory } from "@/lib/database/queries"
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
      description: 'El artículo solicitado no existe.',
    }
  }

  return {
    title: `${article.title} | Guido Blanco`,
    description: article.summary || `Lee ${article.title} en el blog de Guido Blanco`,
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary || undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // Obtener artículos relacionados de la misma categoría
  const relatedArticles = article.category_id 
    ? await getArticlesByCategory(article.category_id, { limit: 3, excludeId: article.id })
    : []

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <ArticleContent article={article} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <RelatedArticles 
                  articles={relatedArticles} 
                  title="Artículos Relacionados"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}