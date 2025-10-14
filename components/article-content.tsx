"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import Image from "next/image"
import { ArticleSidebar } from "@/components/article-sidebar"

interface Article {
  id: string
  title: string
  summary: string | null
  content: string
  cover_image_url: string | null
  published_at: string
  published_date?: string | null
  interview_date?: string | null
  category_name?: string | null
  category_slug?: string | null
  article_tags?: {
    tag_id: string
    name: string
    slug: string
  }[] | null
}

interface SidebarArticle {
  id: string
  title: string
  cover_image_url: string | null
  slug: string
  published_at: string
  category_name?: string | null
}

interface ArticleContentProps {
  article: Article
  sidebarArticles?: SidebarArticle[]
}

export function ArticleContent({ article, sidebarArticles }: ArticleContentProps) {
  return (
    <article className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header completo ancho */}
          <div className="max-w-4xl mx-auto mb-8">
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                {article.category_name && (
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {article.category_name}
                  </Badge>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {(() => {
                      // Priorizar published_date si existe, sino usar published_at
                      const dateToShow = article.published_date || article.published_at
                      return new Date(dateToShow).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    })()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Guido Blanco
                  </div>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">{article.title}</h1>

              {article.summary && <p className="text-xl text-muted-foreground leading-relaxed mb-8">{article.summary}</p>}

              {article.cover_image_url && (
                <div className="relative h-64 lg:h-96 mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={article.cover_image_url || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </header>
          </div>

          {/* Layout con grid: contenido principal y sidebar */}
          <div className="grid lg:grid-cols-4 gap-8 max-w-full">
            {/* Contenido principal */}
            <div className="col-span-full lg:col-span-3 min-w-0 max-w-full overflow-hidden">

              {/* Content */}
              <div className="prose prose-lg max-w-none article-content">
                <div 
                  className="text-foreground leading-relaxed break-words overflow-wrap-break-word max-w-full" 
                  style={{
                    wordBreak: 'normal',
                    overflowWrap: 'break-word',
                    hyphens: 'none',
                    WebkitHyphens: 'none',
                    msHyphens: 'none'
                  }}
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                />
                
                <style jsx>{`
                  .article-content {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: normal;
                    max-width: 100%;
                    width: 100%;
                    hyphens: none;
                    -webkit-hyphens: none;
                    -ms-hyphens: none;
                  }
                  
                  .article-content :global(*) {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: normal;
                    max-width: 100%;
                    hyphens: none;
                    -webkit-hyphens: none;
                    -ms-hyphens: none;
                  }
                  
                  .article-content :global(h1) {
                    font-size: 2.25rem;
                    font-weight: 700;
                    margin: 2rem 0 1rem 0;
                    line-height: 1.2;
                  }
                  
                  .article-content :global(h2) {
                    font-size: 1.875rem;
                    font-weight: 600;
                    margin: 1.75rem 0 0.875rem 0;
                    line-height: 1.3;
                  }
                  
                  .article-content :global(h3) {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 1.5rem 0 0.75rem 0;
                    line-height: 1.4;
                  }
                  
                  .article-content :global(h4) {
                    font-size: 1.25rem;
                    font-weight: 500;
                    margin: 1.25rem 0 0.625rem 0;
                    line-height: 1.4;
                  }
                  
                  .article-content :global(p) {
                    margin: 1rem 0;
                    line-height: 1.7;
                    font-size: 1.125rem;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: normal;
                    max-width: 100%;
                    white-space: pre-wrap;
                    hyphens: none;
                    -webkit-hyphens: none;
                    -ms-hyphens: none;
                  }
                  
                  .article-content :global(blockquote) {
                    border-left: 4px solid #3b82f6;
                    margin: 1.5rem 0;
                    padding: 1rem 1.5rem;
                    font-style: italic;
                    background-color: #f8fafc;
                    border-radius: 0 0.375rem 0.375rem 0;
                  }
                  
                  .article-content :global(ul), .article-content :global(ol) {
                    margin: 1rem 0;
                    padding-left: 1.5rem;
                  }
                  
                  .article-content :global(li) {
                    margin: 0.5rem 0;
                    line-height: 1.6;
                  }
                  
                  .article-content :global(a) {
                    color: #3b82f6;
                    text-decoration: underline;
                    font-weight: 500;
                  }
                  
                  .article-content :global(a:hover) {
                    color: #1d4ed8;
                  }
                  
                  .article-content :global(img) {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1.5rem auto;
                    display: block;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                  }
                  
                  .article-content :global(strong) {
                    font-weight: 600;
                  }
                  
                  .article-content :global(em) {
                    font-style: italic;
                  }
                  
                  .article-content :global(code) {
                    background-color: #f3f4f6;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.875rem;
                  }
                  
                  .article-content :global(pre) {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                  }
                  
                  .article-content :global(pre code) {
                    background-color: transparent;
                    padding: 0;
                    border-radius: 0;
                  }
                  
                  /* Estilos adicionales para controlar desbordamiento */
                  .article-content :global(div),
                  .article-content :global(span),
                  .article-content :global(table),
                  .article-content :global(td),
                  .article-content :global(th) {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    word-break: normal;
                    max-width: 100%;
                    hyphens: none;
                    -webkit-hyphens: none;
                    -ms-hyphens: none;
                  }
                  
                  /* Asegurar que las palabras completas pasen al siguiente renglón */
                  .article-content :global(*) {
                    hyphens: none;
                    -webkit-hyphens: none;
                    -ms-hyphens: none;
                    word-break: normal;
                  }
                `}</style>
              </div>

              {/* Tags */}
              {article.article_tags && article.article_tags.length > 0 && (
                <footer className="mt-12 pt-8 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground mr-2">Etiquetas:</span>
                    {article.article_tags.map((articleTag) => (
                      <Badge key={articleTag.tag_id} variant="outline" className="text-xs">
                        {articleTag.name}
                      </Badge>
                    ))}
                  </div>
                </footer>
              )}
            </div>

            {/* Sidebar con artículos relacionados - Solo visible en desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <ArticleSidebar articles={sidebarArticles || []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
