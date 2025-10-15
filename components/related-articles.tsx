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
  category_name?: string | null
}

interface RelatedArticlesProps {
  articles: Article[]
  title?: string
}

export function RelatedArticles({ articles, title = "Artículos Relacionados" }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return (
      <aside className="space-y-6">
        <h3 className="text-lg font-semibold text-[#1f201b]">{title}</h3>
        <div className="text-sm text-[#6f706a] bg-white/50 rounded-lg p-4">
          No hay artículos relacionados en este momento.
        </div>
      </aside>
    )
  }

  return (
    <aside className="space-y-6">
      <h3 className="text-lg font-semibold text-[#1f201b]">{title}</h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
            <Link href={`/noticias/${article.slug}`}>
              <div className="relative h-32 w-full">
                <Image
                  src={article.cover_image_url || "/placeholder.svg?height=128&width=300"}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                {article.category_name && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-[#1e1e1c] text-[#dadbd5] text-xs">
                      {article.category_name}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4 bg-white">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-[#6f706a]">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.interview_date || article.published_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <h4 className="text-sm font-semibold text-[#1f201b] leading-tight line-clamp-2">
                    {article.title}
                  </h4>

                  {article.summary && (
                    <p className="text-xs text-[#6f706a] leading-relaxed line-clamp-2">{article.summary}</p>
                  )}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </aside>
  )
}
