"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SidebarArticle {
  id: string
  title: string
  cover_image_url: string | null
  slug: string
  published_at: string
  interview_date?: string
  category_name?: string | null
}

interface ArticleSidebarProps {
  articles: SidebarArticle[]
}

export function ArticleSidebar({ articles }: ArticleSidebarProps) {
  if (!articles || articles.length === 0) {
    return (
      <aside className="space-y-6">
        <h3 className="text-lg font-semibold text-[#1f201b]">Otras Noticias</h3>
        <div className="text-sm text-[#6f706a] bg-white/50 rounded-lg p-4">
          No hay otros artículos disponibles en este momento.
        </div>
      </aside>
    )
  }

  return (
    <aside className="space-y-6">
      <h3 className="text-lg font-semibold text-[#1f201b]">
        Otras Noticias 
      </h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
            <Link href={`/noticias/${article.slug}`}>
              <div className="relative h-32 w-full">
                <Image
                  src={article.cover_image_url || "/placeholder.svg?height=128&width=200"}
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
                <h4 className="text-sm font-medium text-[#1f201b] leading-tight line-clamp-2 mb-2">
                  {article.title}
                </h4>
                <div className="flex items-center text-xs text-[#6f706a]">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(article.interview_date || article.published_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </aside>
  )
}