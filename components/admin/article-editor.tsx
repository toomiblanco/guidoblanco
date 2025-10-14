"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Save, Eye, Calendar, Upload, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
  level?: number
  full_path?: string
  children?: Category[]
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
  interviewee_name?: string | null
  interview_date?: string | null
  published_date?: string | null
  featured_image_position?: string | null
  article_tags: {
    tag_id: string
    tags: {
      id: string
      name: string
    }
  }[]
}

interface ArticleEditorProps {
  categories: Category[]
  tags: Tag[]
  article?: Article
}

export function ArticleEditor({ categories, tags, article }: ArticleEditorProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.article_tags?.map(at => at.tag_id) || []
  )
  const [newTagsInput, setNewTagsInput] = useState("")
  const [parsedNewTags, setParsedNewTags] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    summary: article?.summary || "",
    content: article?.content || "",
    cover_image_url: article?.cover_image_url || "",
    category_id: article?.category_id || "none",
    is_featured: article?.is_featured || false,
    is_published: article?.is_published || false,
    interviewee_name: article?.interviewee_name || "",
    interview_date: article?.interview_date ? new Date(article.interview_date).toISOString().split('T')[0] : "",
    published_date: article?.published_date ? new Date(article.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    featured_image_position: article?.featured_image_position || "center",
  })

  // Función para renderizar categorías jerárquicamente en el selector
  const renderCategoryOptions = (categories: Category[], level: number = 0): JSX.Element[] => {
    const result: JSX.Element[] = []
    
    // Filtrar categorías del nivel actual
    const currentLevelCategories = categories.filter(cat => 
      level === 0 ? !cat.parent_id : cat.parent_id === categories[0]?.parent_id
    )
    
    currentLevelCategories.forEach(category => {
      const prefix = "　".repeat(level) // Espacios Unicode para indentación
      const arrow = level > 0 ? "└ " : ""
      
      result.push(
        <SelectItem key={category.id} value={category.id}>
          {prefix}{arrow}{category.name}
        </SelectItem>
      )
      
      // Encontrar y renderizar subcategorías
      const children = categories.filter(cat => cat.parent_id === category.id)
      if (children.length > 0) {
        result.push(...renderCategoryOptions(children, level + 1))
      }
    })
    
    return result
  }

  // Función para generar slug de una etiqueta
  const generateTagSlug = (tagName: string): string => {
    return tagName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Función para procesar las etiquetas nuevas del input
  const processNewTags = (input: string): string[] => {
    if (!input.trim()) return []
    
    return input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .filter(tag => tag.length <= 50) // Límite de longitud
      .slice(0, 10) // Máximo 10 etiquetas nuevas por vez
  }

  // Handler para cuando cambia el input de nuevas etiquetas
  const handleNewTagsInputChange = (value: string) => {
    setNewTagsInput(value)
    const processed = processNewTags(value)
    setParsedNewTags(processed)
  }

  // Función para limpiar contenido antes de enviar (MUY AGRESIVA)
  const cleanContentForDatabase = (content: string): string => {
    return content
      // Eliminar TODOS los metadatos de Word
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<o:p\s*\/?>|<\/o:p>/g, '')
      .replace(/<w:[^>]*>.*?<\/w:[^>]*>/g, '')
      .replace(/<m:[^>]*>.*?<\/m:[^>]*>/g, '')
      .replace(/<v:[^>]*>.*?<\/v:[^>]*>/g, '')
      // Eliminar TODOS los estilos problemáticos
      .replace(/style="[^"]*mso-[^"]*"/g, '')
      .replace(/style="[^"]*Microsoft[^"]*"/g, '')
      .replace(/style="[^"]*Word[^"]*"/g, '')
      .replace(/class="Mso[^"]*"/g, '')
      .replace(/class="Word[^"]*"/g, '')
      // Eliminar atributos problemáticos
      .replace(/lang="[^"]*"/g, '')
      .replace(/xml:lang="[^"]*"/g, '')
      // Normalizar espacios y caracteres especiales (MANTENIENDO — para entrevistas)
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ') // Non-breaking space
      .replace(/\u2019/g, "'") // Smart quote
      .replace(/\u201C/g, '"') // Smart quote
      .replace(/\u201D/g, '"') // Smart quote
      .replace(/\u2013/g, '-') // En dash → dash normal
      // MANTENER \u2014 (—) - EM DASH CRUCIAL PARA ENTREVISTAS
      .replace(/\u2026/g, '...') // Ellipsis
      .replace(/\u00AD/g, '') // Soft hyphen
      // Eliminar TODOS los caracteres de control invisibles
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[\uFEFF\uFFFE\uFFFF]/g, '') // BOM y otros
      // Normalizar múltiples espacios
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Máximo 2 saltos de línea consecutivos
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return

    setIsSubmitting(true)
    try {
      console.log('🔍 Debug - Nuevas etiquetas a crear:', parsedNewTags)
      
      // 1. Primero crear las nuevas etiquetas si las hay
      let newlyCreatedTagIds: string[] = []
      
      if (parsedNewTags.length > 0) {
        console.log('📤 Enviando solicitud para crear etiquetas:', parsedNewTags)
        
        const createTagsResponse = await fetch('/api/admin/tags/create-batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tagNames: parsedNewTags
          }),
        })

        console.log('📥 Respuesta del servidor:', createTagsResponse.status)

        if (createTagsResponse.ok) {
          const createTagsResult = await createTagsResponse.json()
          console.log('✅ Etiquetas creadas exitosamente:', createTagsResult)
          newlyCreatedTagIds = createTagsResult.tags.map((tag: any) => tag.id)
        } else {
          const error = await createTagsResponse.json()
          console.error('❌ Error creando etiquetas:', error)
          throw new Error(error.error || 'Error creando nuevas etiquetas')
        }
      }

      // 2. Combinar etiquetas seleccionadas existentes con las nuevas creadas
      const allTagIds = [...selectedTags, ...newlyCreatedTagIds]
      console.log('🏷️ Todos los IDs de etiquetas (existentes + nuevas):', allTagIds)

      const articleData = {
        ...formData,
        // Limpiar el contenido antes de enviarlo
        content: cleanContentForDatabase(formData.content),
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        published_at: formData.is_published ? new Date().toISOString() : null,
        // Enviar el email para que el backend lo convierta a UUID
        author_email: session.user.email,
        // Limpiar campos vacíos
        category_id: formData.category_id === 'none' ? null : formData.category_id || null,
        summary: formData.summary || null,
        cover_image_url: formData.cover_image_url || null,
        interviewee_name: formData.interviewee_name || null,
        interview_date: formData.interview_date || null,
        published_date: formData.published_date || null,
      }

      console.log('📝 Datos del artículo (limpiados):', {
        ...articleData,
        content: `${articleData.content.length} caracteres`
      })

      const url = article ? `/api/admin/articles/${article.id}` : '/api/admin/articles'
      const method = article ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...articleData,
          tags: allTagIds
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Server error:', response.status, errorData)
        
        // Mostrar error más específico
        let errorMessage = 'Error al guardar el artículo'
        if (response.status === 413) {
          errorMessage = `El contenido es muy extenso (${Math.round(articleData.content.length/1000)}k caracteres). 
          
OPCIONES:
1. Usar el botón "🧹 Limpiar formato de Word" primero
2. Dividir la entrevista en 2-3 partes más pequeñas
3. Contactar al administrador para aumentar límites del servidor`
        } else if (response.status === 400) {
          errorMessage = 'Error en los datos del artículo. Revisa que todos los campos estén correctos.'
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor. El contenido podría tener caracteres problemáticos.'
        }
        
        throw new Error(`${errorMessage} (Código: ${response.status})`)
      }

      const result = await response.json()
      console.log('✅ Artículo guardado exitosamente:', result)
      
      // Limpiar las nuevas etiquetas después del éxito
      setNewTagsInput("")
      setParsedNewTags([])
      
      router.push('/admin/articulos')
      router.refresh()
    } catch (error: any) {
      console.error('❌ Error completo:', error)
      
      // Mensaje de error más detallado
      let errorMessage = 'Error al guardar el artículo'
      
      if (error.message.includes('413')) {
        errorMessage = 'El contenido es demasiado largo. Intenta dividir la entrevista en partes más pequeñas.'
      } else if (error.message.includes('400')) {
        errorMessage = 'Error en los datos. Verifica que el título no esté vacío y que el contenido sea válido.'
      } else if (error.message.includes('duplicate')) {
        errorMessage = 'Ya existe un artículo con ese título o slug. Cambia el título.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'El servidor tardó demasiado en responder. Intenta nuevamente.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`${errorMessage}\n\nRevisa la consola del navegador para más detalles.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const generateSlug = () => {
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleCoverImageUpload = async (file: File) => {
    try {
      console.log('Uploading cover image:', file.name, file.size)
      
      const formDataImg = new FormData()
      formDataImg.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataImg,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload error response:', errorText)
        throw new Error(`Error al subir la imagen: ${response.status}`)
      }

      const result = await response.json()
      console.log('Upload success:', result)
      setFormData(prev => ({ ...prev, cover_image_url: result.url }))
      
      alert('Imagen subida exitosamente')
    } catch (error) {
      console.error('Error uploading cover image:', error)
      alert('Error al subir la imagen de portada')
    }
  }

  const triggerFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleCoverImageUpload(file)
      }
    }
    input.click()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Artículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="summary">Resumen</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={3}
                  placeholder="Breve descripción del artículo..."
                />
              </div>

              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Escribe aquí el contenido principal del artículo..."
                height="500px"
              />
              
              {/* Herramientas para contenido */}
              <div className="flex gap-4 items-center text-sm p-3 bg-muted/30 rounded">
                <div className="flex-1">
                  <span className="text-muted-foreground">
                    📝 Caracteres: <strong>{formData.content.length.toLocaleString()}</strong>
                  </span>
                  <span className="text-muted-foreground ml-4">
                    💾 Tamaño: <strong>{Math.round(formData.content.length/1024)} KB</strong>
                  </span>
                  {formData.content.length > 100000 && (
                    <span className="text-orange-600 ml-4">
                      ⚠️ Contenido muy extenso
                    </span>
                  )}
                  {formData.content.length > 500000 && (
                    <span className="text-red-600 ml-4">
                      🚨 Contenido extremadamente largo
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const beforeLength = formData.content.length
                    const cleaned = cleanContentForDatabase(formData.content)
                    const afterLength = cleaned.length
                    setFormData(prev => ({ ...prev, content: cleaned }))
                    alert(`Contenido limpiado exitosamente!\n\nAntes: ${beforeLength.toLocaleString()} caracteres\nDespués: ${afterLength.toLocaleString()} caracteres\nReducción: ${((beforeLength-afterLength)/beforeLength*100).toFixed(1)}%`)
                  }}
                >
                  🧹 Limpiar formato de Word
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Entrevista (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="interviewee_name">Nombre del Entrevistado</Label>
                <Input
                  id="interviewee_name"
                  value={formData.interviewee_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, interviewee_name: e.target.value }))}
                  placeholder="Ej: Juan Pérez, Director de..."
                />
              </div>

              <div>
                <Label htmlFor="interview_date">Fecha de la Entrevista</Label>
                <Input
                  id="interview_date"
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, interview_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="published_date">Fecha de Publicación</Label>
                <Input
                  id="published_date"
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagen de Portada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cover_image">URL de Imagen</Label>
                <div className="flex gap-2">
                  <Input
                    id="cover_image"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={triggerFileUpload}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formData.cover_image_url && (
                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={formData.cover_image_url} 
                      alt="Vista previa" 
                      className="w-full h-32 object-cover"
                      style={{ objectPosition: formData.featured_image_position }}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="image_position">Posición de la Imagen</Label>
                <Select
                  value={formData.featured_image_position}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, featured_image_position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="top">Superior</SelectItem>
                    <SelectItem value="bottom">Inferior</SelectItem>
                    <SelectItem value="left">Izquierda</SelectItem>
                    <SelectItem value="right">Derecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {renderCategoryOptions(categories)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="featured">Artículo destacado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="published">Publicar</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                      className="rounded"
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedTags.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Etiquetas seleccionadas:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId)
                      return tag ? (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tag.id)}
                            className="ml-1 hover:bg-red-200 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Campo para nuevas etiquetas */}
              <div className="mt-6 space-y-3">
                <Label className="text-sm font-medium">Crear nuevas etiquetas</Label>
                <p className="text-xs text-muted-foreground">
                  Escribe etiquetas separadas por coma. Se crearán automáticamente y se guardarán para uso futuro.
                </p>
                <Input
                  placeholder="Ej: política, economía, análisis..."
                  value={newTagsInput}
                  onChange={(e) => handleNewTagsInputChange(e.target.value)}
                  className="w-full"
                />
                
                {parsedNewTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Nuevas etiquetas que se crearán ({parsedNewTags.length}):
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {parsedNewTags.map((tagName, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tagName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Guardando...' : (article ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}