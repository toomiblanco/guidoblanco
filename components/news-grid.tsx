import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Article {
  id: string
  title: string
  summary: string | null
  cover_image_url: string | null
  slug: string
  published_at: string
  interview_date?: string
  categories: {
    id: string
    name: string
    slug: string
  } | null
  article_tags?: {
    tags: {
      id: string
      name: string
      slug: string
    }
  }[]
}

interface NewsGridProps {
  articles: Article[]
}

export function NewsGrid({ articles }: NewsGridProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron artículos</h3>
        <p className="text-muted-foreground">Intenta ajustar los filtros o buscar con otros términos.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {articles.map((article) => (
        <Card
          key={article.id}
          className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-0"
        >
          <div className="relative h-48 w-full">
            <Image
              src={article.cover_image_url || "/placeholder.svg?height=200&width=400"}
              alt={article.title}
              fill
              className="object-cover w-full h-full"
            />
            {article.categories && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                  {article.categories.name}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(article.interview_date || article.published_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              <h3 className="text-xl font-semibold text-foreground leading-tight">
                <Link href={`/noticias/${article.slug}`} className="hover:text-primary transition-colors">
                  {article.title}
                </Link>
              </h3>

              {article.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{article.summary}</p>
              )}

              {article.article_tags && article.article_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.article_tags.slice(0, 3).map((articleTag) => (
                    <Badge key={articleTag.tags.id} variant="outline" className="text-xs">
                      {articleTag.tags.name}
                    </Badge>
                  ))}
                </div>
              )}

              <Link
                href={`/noticias/${article.slug}`}
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Leer más →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
