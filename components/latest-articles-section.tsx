import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getLatestArticles } from "@/lib/database/queries"

function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export async function LatestArticlesSection() {
  let latestArticles = []
  
  try {
    latestArticles = await getLatestArticles(6)
  } catch (error) {
    console.error('Error fetching latest articles:', error)
  }
  return (
    <section className="py-20 bg-[#dadbd5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12">
          <h2 className="text-5xl lg:text-6xl font-black text-[#1f201b] mb-4 uppercase tracking-tight">ÚLTIMAS PUBLICACIONES</h2>
          <p className="text-lg text-[#6f706a] max-w-2xl">
            Los artículos más recientes sobre los temas que están marcando la actualidad
          </p>
        </div>

        {latestArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {latestArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/50 hover:bg-white/70 p-0 rounded-2xl"
              >
                <div className="relative h-48">
                  <Image
                    src={article.cover_image_url || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                  {article.category_name && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-[#1e1e1c] text-[#dadbd5] text-xs">
                        {article.category_name}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-xs text-[#6f706a]">
                      <Calendar className="h-3 w-3" />
                      {formatDateShort(article.interview_date || article.published_at)}
                    </div>

                    <h3 className="text-lg font-semibold text-[#1f201b] leading-tight line-clamp-2">{article.title}</h3>

                    {article.summary && (
                      <p className="text-sm text-[#6f706a] leading-relaxed line-clamp-3">{article.summary}</p>
                    )}

                    <Link
                      href={`/noticias/${article.slug}`}
                      className="inline-flex items-center text-[#1e1e1c] hover:text-[#1f201b] text-sm font-medium transition-colors"
                    >
                      Leer más →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-[#6f706a]">No hay artículos publicados en este momento.</p>
          </div>
        )}

        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="group bg-transparent border-[#1e1e1c] text-[#1e1e1c] hover:bg-[#1e1e1c] hover:text-[#dadbd5]">
            <Link href="/noticias">
              Ver todas las noticias
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
