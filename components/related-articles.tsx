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
  categories: {
    id: string
    name: string
    slug: string
  } | null
}

interface RelatedArticlesProps {
  articles: Article[]
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-card-foreground mb-8">Artículos Relacionados</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-32">
                  <Image
                    src={article.cover_image_url || "/placeholder.svg?height=128&width=300"}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  {article.categories && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                        {article.categories.name}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.published_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                    <h3 className="text-sm font-semibold text-card-foreground leading-tight line-clamp-2">
                      <Link href={`/noticias/${article.slug}`} className="hover:text-primary transition-colors">
                        {article.title}
                      </Link>
                    </h3>

                    {article.summary && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.summary}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
