import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit } from "lucide-react"
import Link from "next/link"

interface Article {
  id: string
  title: string
  is_published: boolean
  created_at: string
  categories: {
    name: string
  } | null
}

interface RecentArticlesProps {
  articles: Article[]
}

export function RecentArticles({ articles }: RecentArticlesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Artículos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">{article.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.created_at).toLocaleDateString("es-ES")}
                  {article.categories && <span>• {article.categories.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={article.is_published ? "default" : "secondary"}>
                  {article.is_published ? "Publicado" : "Borrador"}
                </Badge>
                <Link href={`/admin/articulos/${article.id}/editar`}>
                  <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Link>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay artículos recientes</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
