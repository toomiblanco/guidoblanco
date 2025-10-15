"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Eye, Search } from "lucide-react"
import Link from "next/link"

interface Article {
  id: string
  title: string
  slug: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  published_at: string | null
  categories: {
    name: string
  } | null
}

interface ArticlesTableProps {
  articles: Article[]
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredArticles = articles.filter((article) => article.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDelete = async (articleId: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el artículo "${title}"?`)) {
      return
    }

    setDeletingId(articleId)
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el artículo')
      }

      // Recargar la página para actualizar la lista
      window.location.reload()
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Error al eliminar el artículo')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Todos los Artículos</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{article.title}</h4>
                  {article.is_featured && (
                    <Badge variant="secondary" className="text-xs">
                      Destacado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Creado: {new Date(article.created_at).toLocaleDateString("es-ES")}</span>
                  {article.published_at && (
                    <span>Publicado: {new Date(article.published_at).toLocaleDateString("es-ES")}</span>
                  )}
                  {article.categories && <span>Categoría: {article.categories.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={article.is_published ? "default" : "secondary"}>
                  {article.is_published ? "Publicado" : "Borrador"}
                </Badge>
                <div className="flex items-center gap-1">
                  {article.is_published && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/${article.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/articulos/${article.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={deletingId === article.id}
                  >
                    <Trash2 className={`h-4 w-4 text-destructive ${deletingId === article.id ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredArticles.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "No se encontraron artículos" : "No hay artículos creados"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
