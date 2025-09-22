"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, ChevronRight } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { EditCategoryDialog } from "./edit-category-dialog"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  parent_name?: string
  level?: number
  created_at: string
  subcategories?: Category[]
}

interface CategoriesTableProps {
  categories: Category[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Organizar categorías en estructura jerárquica
  const organizeCategories = (cats: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Crear mapa de todas las categorías
    cats.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, subcategories: [] })
    })

    // Organizar en jerarquía
    cats.forEach(cat => {
      const category = categoryMap.get(cat.id)!
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.subcategories!.push(category)
      } else {
        rootCategories.push(category)
      }
    })

    return rootCategories
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría y todas sus subcategorías?')) {
      return
    }

    setIsDeleting(categoryId)
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error al eliminar la categoría')
    } finally {
      setIsDeleting(null)
    }
  }

  const renderCategory = (category: Category, level = 0) => (
    <div key={category.id} className="space-y-2">
      <div 
        className={`flex items-center justify-between p-4 border border-border rounded-lg ${
          level > 0 ? 'ml-' + (level * 6) + ' border-l-4 border-l-muted' : ''
        }`}
        style={{ marginLeft: level > 0 ? `${level * 1.5}rem` : '0' }}
      >
        <div className="flex items-center space-x-3 flex-1">
          {category.subcategories && category.subcategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(category.id)}
              className="p-1 h-6 w-6"
            >
              <ChevronRight 
                className={`h-4 w-4 transition-transform ${
                  expandedCategories.has(category.id) ? 'rotate-90' : ''
                }`} 
              />
            </Button>
          )}
          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium">{category.name}</h4>
              {level > 0 && (
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  Subcategoría
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Slug: {category.slug}</p>
            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditCategoryDialog 
            category={category} 
            availableCategories={categories.filter(cat => cat.id !== category.id)} 
          />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDelete(category.id)}
            disabled={isDeleting === category.id}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      {category.subcategories && 
       category.subcategories.length > 0 && 
       expandedCategories.has(category.id) && (
        <div className="space-y-2">
          {category.subcategories.map(subcat => renderCategory(subcat, level + 1))}
        </div>
      )}
    </div>
  )

  const organizedCategories = organizeCategories(categories)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías Existentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {organizedCategories.map(category => renderCategory(category))}
          {categories.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay categorías creadas</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
