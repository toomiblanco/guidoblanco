"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Save, Eye, Calendar, Upload, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ImageUploader } from "@/components/ui/image-uploader"
import { ImageCropper } from "@/components/ui/image-cropper"

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface Article {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  cover_image_url: string | null
  category_id: string | null
  is_featured: boolean
  is_published: boolean
  published_at: string | null
  article_tags: {
    tag_id: string
    tags: {
      id: string
      name: string
    }
  }[]
}

interface ArticleEditorProps {
  article?: Article
  categories: Category[]
  tags: Tag[]
}

export function ArticleEditor({ article, categories, tags }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title || "")
  const [summary, setSummary] = useState(article?.summary || "")
  const [content, setContent] = useState(article?.content || "")
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url || "")
  const [categoryId, setCategoryId] = useState(article?.category_id || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.article_tags.map((at) => at.tag_id) || [])
  const [isFeatured, setIsFeatured] = useState(article?.is_featured || false)
  const [isPublished, setIsPublished] = useState(article?.is_published || false)
  const [publishDate, setPublishDate] = useState(
    article?.published_at 
      ? new Date(article.published_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState("")
  const router = useRouter()

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleCoverImageInsert = (imageUrl: string) => {
    setTempImageUrl(imageUrl)
    setShowImageCropper(true)
  }

  const handleImageCropSave = (croppedImageUrl: string) => {
    setCoverImageUrl(croppedImageUrl)
    setShowImageCropper(false)
    setTempImageUrl("")
  }

  const handleImageCropClose = () => {
    setShowImageCropper(false)
    setTempImageUrl("")
  }

  const handlePreview = () => {
    // Crear un objeto temporal del artículo para previsualización
    const previewData = {
      title,
      summary,
      content,
      coverImageUrl,
      categoryId,
      selectedTags,
      isFeatured,
      publishDate
    }
    
    // Guardar en localStorage para acceder desde la página de preview
    localStorage.setItem('articlePreview', JSON.stringify(previewData))
    
    // Abrir en nueva ventana/pestaña
    window.open('/admin/preview', '_blank')
  }

  const handleSave = async (publish = false) => {
    if (!title.trim() || !content.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const slug = generateSlug(title)
      const articleData = {
        title: title.trim(),
        slug,
        summary: summary.trim() || null,
        content: content.trim(),
        cover_image_url: coverImageUrl.trim() || null,
        category_id: categoryId || null,
        is_featured: isFeatured,
        is_published: publish || isPublished,
        published_at: publish || isPublished ? new Date(publishDate + 'T00:00:00').toISOString() : null,
        author_id: (await supabase.auth.getUser()).data.user?.id,
      }

      let articleId = article?.id

      if (article) {
        // Update existing article
        const { error } = await supabase.from("articles").update(articleData).eq("id", article.id)
        if (error) throw error
      } else {
        // Create new article
        const { data, error } = await supabase.from("articles").insert(articleData).select().single()
        if (error) throw error
        articleId = data.id
      }

      // Update article tags
      if (articleId) {
        // Delete existing tags
        await supabase.from("article_tags").delete().eq("article_id", articleId)

        // Insert new tags
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map((tagId) => ({
            article_id: articleId,
            tag_id: tagId,
          }))
          await supabase.from("article_tags").insert(tagInserts)
        }
      }

      router.push("/admin/articulos")
    } catch (error) {
      console.error("Error saving article:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contenido del Artículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del artículo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Resumen</Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Breve resumen del artículo"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen de Portada</Label>
              <div className="flex gap-2">
                <ImageUploader onImageInsert={handleCoverImageInsert}>
                  <Button variant="outline" type="button">
                    <Upload className="h-4 w-4 mr-2" />
                    {coverImageUrl ? "Cambiar Imagen" : "Subir Imagen"}
                  </Button>
                </ImageUploader>
                {coverImageUrl && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTempImageUrl(coverImageUrl)
                        setShowImageCropper(true)
                      }}
                      type="button"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Ajustar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCoverImageUrl("")}
                      type="button"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Quitar
                    </Button>
                  </>
                )}
              </div>
              {coverImageUrl && (
                <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden border">
                  <img src={coverImageUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido *</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido del artículo aquí..."
                className="min-h-[500px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Publish Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Artículo Destacado</Label>
              <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="published">Publicado</Label>
              <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publish-date">Fecha de Publicación</Label>
              <Input
                id="publish-date"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full"
              />
            </div>

            {!isPublished && title.trim() && content.trim() && (
              <Button 
                onClick={handlePreview} 
                variant="secondary" 
                className="w-full mb-2"
                disabled={isLoading}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Borrador
              </Button>
            )}

            <div className="flex gap-2">
              <Button onClick={() => handleSave(false)} disabled={isLoading} variant="outline" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
              <Button onClick={() => handleSave(true)} disabled={isLoading} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                {isLoading ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category */}
        <Card>
          <CardHeader>
            <CardTitle>Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Etiquetas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId)
                  return (
                    <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                      {tag?.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tagId)} />
                    </Badge>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags
                  .filter((tag) => !selectedTags.includes(tag.id))
                  .map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Cropper Dialog */}
      <ImageCropper
        imageUrl={tempImageUrl}
        isOpen={showImageCropper}
        onClose={handleImageCropClose}
        onSave={handleImageCropSave}
      />
    </div>
  )
}
