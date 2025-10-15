import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getFeaturedArticle } from "@/lib/database/queries"

export async function FeaturedNewsSection() {
  let featuredArticle = null
  
  try {
    featuredArticle = await getFeaturedArticle()
  } catch (error) {
    console.error('Error fetching featured article:', error)
    // Continuar con featuredArticle = null
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long", 
      day: "numeric",
    })
  }

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
    <section id="featured-news" className="py-20 bg-[#dadbd5]">
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="mb-4 flex items-center gap-4 text-sm">
              {featuredArticle.category_name && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {featuredArticle.category_name}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(featuredArticle.interview_date || featuredArticle.published_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>5 min lectura</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white leading-tight">{featuredArticle.title}</h3>
              
              {featuredArticle.summary && (
                <p className="text-white/90 leading-relaxed">{featuredArticle.summary}</p>
              )}
              
              <Link
                href={`/${featuredArticle.slug}`}
                className="inline-flex items-center text-white font-medium hover:text-gray-200 transition-colors"
              >
                Leer más →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}