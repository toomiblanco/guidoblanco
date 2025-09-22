"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface PreviewData {
  title: string
  summary: string
  content: string
  coverImageUrl: string
  categoryId: string
  selectedTags: string[]
  isFeatured: boolean
  publishDate: string
}

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

export default function PreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        // Obtener datos del localStorage
        const storedData = localStorage.getItem('articlePreview')
        if (!storedData) {
          console.error('No preview data found')
          return
        }

        const data: PreviewData = JSON.parse(storedData)
        setPreviewData(data)

        const supabase = createClient()

        // Obtener información de la categoría
        if (data.categoryId) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', data.categoryId)
            .single()
          
          if (categoryData) {
            setCategory(categoryData)
          }
        }

        // Obtener información de las etiquetas
        if (data.selectedTags.length > 0) {
          const { data: tagsData } = await supabase
            .from('tags')
            .select('*')
            .in('id', data.selectedTags)
          
          if (tagsData) {
            setTags(tagsData)
          }
        }
      } catch (error) {
        console.error('Error loading preview data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPreviewData()
  }, [])

  const handleClose = () => {
    window.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando vista previa...</p>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">No se pudo cargar la vista previa del artículo.</p>
          <Button onClick={handleClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header de previsualización */}
      <div className="bg-orange-100 dark:bg-orange-900 border-b border-orange-200 dark:border-orange-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Vista Previa - Este artículo no está publicado
            </span>
          </div>
          <Button onClick={handleClose} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Editor
          </Button>
        </div>
      </div>

      {/* Contenido del artículo */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="space-y-8">
          {/* Header del artículo */}
          <header className="space-y-6">
            {previewData.isFeatured && (
              <Badge variant="secondary" className="text-sm">
                Artículo Destacado
              </Badge>
            )}
            
            <h1 className="text-4xl font-bold tracking-tight">
              {previewData.title}
            </h1>

            {previewData.summary && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {previewData.summary}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Guido Blanco</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(previewData.publishDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {category && (
                <Badge variant="outline">{category.name}</Badge>
              )}
            </div>
          </header>

          {/* Imagen de portada */}
          {previewData.coverImageUrl && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <img 
                src={previewData.coverImageUrl} 
                alt={previewData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Contenido */}
          <div className="text-lg leading-relaxed space-y-4">
            <div 
              className="article-content [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:mb-4 [&>img]:rounded-lg [&>img]:mb-4"
              dangerouslySetInnerHTML={{ __html: previewData.content }} 
            />
          </div>

          {/* Etiquetas */}
          {tags.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Etiquetas:</span>
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  )
}