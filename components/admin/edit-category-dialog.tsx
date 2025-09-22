"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
}

interface EditCategoryDialogProps {
  category: Category
  availableCategories: Category[]
}

export function EditCategoryDialog({ category, availableCategories }: EditCategoryDialogProps) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description || "")
  const [parentId, setParentId] = useState<string>(category.parent_id || "none")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Filtrar categorías disponibles para evitar seleccionar la misma categoría o sus descendientes
  const filteredCategories = availableCategories.filter(cat => cat.id !== category.id)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const slug = generateSlug(name)
      const { error } = await supabase
        .from("categories")
        .update({
          name: name.trim(),
          slug,
          description: description.trim() || null,
          parent_id: parentId === "none" ? null : parentId,
        })
        .eq("id", category.id)

      if (error) throw error

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Error al actualizar la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(category.name)
      setDescription(category.description || "")
      setParentId(category.parent_id || "none")
    }
  }, [isOpen, category])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la categoría"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-parent">Categoría Padre (Opcional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría padre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna (Categoría Principal)</SelectItem>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}