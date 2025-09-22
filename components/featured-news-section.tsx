import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getFeaturedArticle, formatDate } from "@/lib/supabase/articles"

export async function FeaturedNewsSection() {
  const featuredArticle = await getFeaturedArticle()

  if (!featuredArticle) {
    return (
      <section className="py-20 bg-[#dadbd5]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl lg:text-6xl font-black text-[#1f201b] mb-4 uppercase tracking-tight">NOTICIA DESTACADA</h2>
            <p className="text-lg text-[#6f706a]">No hay artículos destacados en este momento.</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-20 bg-[#dadbd5]">
      {/* Title Section with container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-left">
          <h2 className="text-5xl lg:text-6xl font-black text-[#1f201b] mb-4 uppercase tracking-tight">NOTICIA DESTACADA</h2>
          <p className="text-lg text-[#6f706a] max-w-2xl">
            El análisis más reciente sobre los temas que están marcando la agenda
          </p>
        </div>
      </div>

      {/* Card with same margins as title and rounded corners */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full h-[500px] overflow-hidden rounded-3xl shadow-2xl">
          {/* Background Image */}
          <Image
            src={featuredArticle.cover_image_url || "/placeholder.svg"}
            alt={featuredArticle.title}
            fill
            className="object-cover"
          />
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/70"></div>
        
        {/* Content positioned on the right */}
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="w-full max-w-lg mr-8 lg:mr-16">
            {/* Text background with gradient */}
            <div className="bg-gradient-to-r from-white/95 to-white/85 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
              <div className="space-y-4">
                {featuredArticle.category_name && (
                  <div className="mb-4">
                    <Badge variant="secondary" className="bg-[#1e1e1c] text-[#dadbd5]">
                      {featuredArticle.category_name}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-[#6f706a]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredArticle.published_at || featuredArticle.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    5 min
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-[#1f201b] leading-tight">{featuredArticle.title}</h3>

                {featuredArticle.summary && (
                  <p className="text-[#6f706a] leading-relaxed">{featuredArticle.summary}</p>
                )}

                <Link
                  href={`/noticias/${featuredArticle.slug}`}
                  className="inline-flex items-center text-[#1e1e1c] hover:text-[#1f201b] font-medium transition-colors"
                >
                  Leer artículo completo →
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
