"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

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

interface NewsFiltersProps {
  categories: Category[]
  tags: Tag[]
  currentCategory?: string
  currentTag?: string
  currentSearch?: string
}

export function NewsFilters({ categories, tags, currentCategory, currentTag, currentSearch }: NewsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(currentSearch || "")

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/noticias?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters("buscar", searchTerm || null)
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    router.push("/noticias")
  }

  const hasActiveFilters = currentCategory || currentTag || currentSearch

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm" className="w-full">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {currentCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Categoría: {categories.find((c) => c.slug === currentCategory)?.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters("categoria", null)} />
                  </Badge>
                )}
                {currentTag && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Etiqueta: {tags.find((t) => t.slug === currentTag)?.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters("etiqueta", null)} />
                  </Badge>
                )}
                {currentSearch && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Búsqueda: {currentSearch}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters("buscar", null)} />
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Limpiar todos los filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <button
              onClick={() => updateFilters("categoria", null)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                !currentCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => updateFilters("categoria", category.slug)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  currentCategory === category.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Etiquetas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={currentTag === tag.slug ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => updateFilters("etiqueta", currentTag === tag.slug ? null : tag.slug)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
