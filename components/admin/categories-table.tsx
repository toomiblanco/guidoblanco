"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Loader2, ChevronRight, Folder, FolderTree } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  created_at?: string
  children?: Category[]
  level?: number
  full_path?: string
}

interface CategoriesTableProps {
  categories: Category[]
}

export function CategoriesTable({ categories: initialCategories }: CategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  })

  const { toast } = useToast()

  const resetForm = () => {
    setFormData({ name: '', description: '', parent_id: 'none' })
    setEditingCategory(null)
  }

  // Función para obtener categorías disponibles como padre (evita crear ciclos)
  const getAvailableParentCategories = () => {
    if (!editingCategory) return categories
    
    // Función recursiva para obtener todos los descendientes
    const getDescendants = (categoryId: string): string[] => {
      const descendants: string[] = []
      const findChildren = (id: string) => {
        categories.forEach(cat => {
          if (cat.parent_id === id) {
            descendants.push(cat.id)
            findChildren(cat.id)
          }
        })
      }
      findChildren(categoryId)
      return descendants
    }

    const descendantIds = getDescendants(editingCategory.id)
    return categories.filter(cat => 
      cat.id !== editingCategory.id && !descendantIds.includes(cat.id)
    )
  }

  // Función para renderizar categorías de forma jerárquica
  const renderCategoryTree = (categoriesToRender: Category[], level: number = 0) => {
    return categoriesToRender.map((category) => {
      const children = categories.filter(cat => cat.parent_id === category.id)
      
      return (
        <div key={category.id}>
          <div 
            className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors"
            style={{ marginLeft: `${level * 20}px` }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {level > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                {category.parent_id ? <Folder className="w-4 h-4 text-muted-foreground" /> : <FolderTree className="w-4 h-4 text-muted-foreground" />}
                <h3 className="font-medium">{category.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {category.slug}
                </Badge>
                {level > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Subcategoría
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground" style={{ marginLeft: `${level > 0 ? 24 : 0}px` }}>
                  {category.description}
                </p>
              )}
              {category.full_path && level > 0 && (
                <p className="text-xs text-muted-foreground mt-1" style={{ marginLeft: `${level > 0 ? 24 : 0}px` }}>
                  Ruta: {category.full_path}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(category)}
                disabled={isEditing || isDeleting}
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isEditing || isDeleting || children.length > 0}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {children.length > 0 
                        ? `No puedes eliminar "${category.name}" porque tiene ${children.length} subcategoría(s). Elimina primero las subcategorías.`
                        : `Esta acción no se puede deshacer. La categoría "${category.name}" será eliminada permanentemente.`
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    {children.length === 0 && (
                      <AlertDialogAction
                        onClick={() => openDeleteDialog(category)}
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
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* Renderizar subcategorías recursivamente */}
          {children.length > 0 && (
            <div className="mt-2 space-y-2">
              {renderCategoryTree(children, level + 1)}
            </div>
          )}
        </div>
      )
    })
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
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          parent_id: formData.parent_id === 'none' ? null : formData.parent_id || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la categoría')
      }

      const newCategory = await response.json()
      setCategories(prev => [...prev, newCategory])
      setCreateDialogOpen(false)
      resetForm()
      
      toast({
        title: "Éxito",
        description: "Categoría creada correctamente"
      })
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la categoría",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = async () => {
    if (!formData.name.trim() || !editingCategory) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive"
      })
      return
    }

    setIsEditing(true)
    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          parent_id: formData.parent_id === 'none' ? null : formData.parent_id || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar la categoría')
      }

      const updatedCategory = await response.json()
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      ))
      setEditDialogOpen(false)
      resetForm()
      
      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente"
      })
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la categoría",
        variant: "destructive"
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar la categoría')
      }

      setCategories(prev => prev.filter(cat => cat.id !== deletingCategory.id))
      setDeleteDialogOpen(false)
      setDeletingCategory(null)
      
      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente"
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la categoría",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || 'none'
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle>Categorías ({categories.length})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestiona las categorías de tus artículos
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
              <DialogDescription>
                Completa la información para crear una nueva categoría.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nombre *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Política, Deportes, Tecnología..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-parent">Categoría Padre</Label>
                <Select 
                  value={formData.parent_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría padre</SelectItem>
                    {categories
                      .filter(cat => !cat.parent_id) // Solo mostrar categorías raíz
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-description">Descripción</Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional de la categoría..."
                  rows={3}
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
                  'Crear Categoría'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay categorías creadas aún.</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera categoría
              </Button>
            </div>
          ) : (
            renderCategoryTree(categories.filter(cat => !cat.parent_id))
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Modifica la información de la categoría.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Política, Deportes, Tecnología..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parent">Categoría Padre</Label>
              <Select 
                value={formData.parent_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría padre (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría padre</SelectItem>
                  {getAvailableParentCategories()
                    .filter(cat => !cat.parent_id) // Solo mostrar categorías raíz disponibles
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional de la categoría..."
                rows={3}
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
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la categoría &quot;{deletingCategory?.name}&quot;?
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