"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  parent_id: string | null
}

export function CreateCategoryForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [parentId, setParentId] = useState<string>("none")
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .is('parent_id', null) // Solo categorías principales para evitar subcategorías anidadas muy profundas
      .order('name')
    
    if (data) {
      setAvailableCategories(data)
    }
  }

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
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        slug,
        description: description.trim() || null,
        parent_id: parentId === "none" ? null : parentId,
      })

      if (error) throw error

      setName("")
      setDescription("")
      setParentId("none")
      fetchCategories() // Actualizar lista de categorías disponibles
      router.refresh()
    } catch (error) {
      console.error("Error creating category:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la categoría"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="parent">Categoría Padre (Opcional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría padre o déjalo vacío para categoría principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna (Categoría Principal)</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>
          
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? "Creando..." : (parentId !== "none" ? "Crear Subcategoría" : "Crear Categoría")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
