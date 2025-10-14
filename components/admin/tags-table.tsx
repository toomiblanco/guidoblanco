"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Loader2, Tag } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Tag {
  id: string
  name: string
  slug: string
  created_at?: string
}

interface TagsTableProps {
  tags: Tag[]
}

export function TagsTable({ tags: initialTags }: TagsTableProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: ''
  })

  const { toast } = useToast()

  const resetForm = () => {
    setFormData({ name: '' })
    setEditingTag(null)
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la etiqueta')
      }

      const newTag = await response.json()
      setTags(prev => [...prev, newTag])
      setCreateDialogOpen(false)
      resetForm()
      
      toast({
        title: "Éxito",
        description: "Etiqueta creada correctamente"
      })
    } catch (error) {
      console.error('Error creating tag:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la etiqueta",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = async () => {
    if (!formData.name.trim() || !editingTag) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive"
      })
      return
    }

    setIsEditing(true)
    try {
      const response = await fetch(`/api/admin/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar la etiqueta')
      }

      const updatedTag = await response.json()
      setTags(prev => prev.map(tag => 
        tag.id === editingTag.id ? updatedTag : tag
      ))
      setEditDialogOpen(false)
      resetForm()
      
      toast({
        title: "Éxito",
        description: "Etiqueta actualizada correctamente"
      })
    } catch (error) {
      console.error('Error updating tag:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la etiqueta",
        variant: "destructive"
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTag) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/tags/${deletingTag.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar la etiqueta')
      }

      setTags(prev => prev.filter(tag => tag.id !== deletingTag.id))
      setDeleteDialogOpen(false)
      setDeletingTag(null)
      
      toast({
        title: "Éxito",
        description: "Etiqueta eliminada correctamente"
      })
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la etiqueta",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (tag: Tag) => {
    setDeletingTag(tag)
    setDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Etiquetas ({tags.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestiona las etiquetas para categorizar tus artículos
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Etiqueta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Etiqueta</DialogTitle>
              <DialogDescription>
                Ingresa el nombre para crear una nueva etiqueta.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nombre *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: urgente, destacado, nacional..."
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Etiqueta'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {tags.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No hay etiquetas creadas aún.</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera etiqueta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tags.map((tag) => (
                <div key={tag.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-sm">
                      {tag.name}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(tag)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Slug: {tag.slug}
                    </p>
                    {tag.created_at && (
                      <p className="text-xs text-muted-foreground">
                        Creado: {new Date(tag.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etiqueta</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la etiqueta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: urgente, destacado, nacional..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isEditing}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la etiqueta &quot;{deletingTag?.name}&quot;?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}