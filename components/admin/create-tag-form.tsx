"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function CreateTagForm() {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
      const { error } = await supabase.from("tags").insert({
        name: name.trim(),
        slug,
      })

      if (error) throw error

      setName("")
      router.refresh()
    } catch (error) {
      console.error("Error creating tag:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Etiqueta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Nombre</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la etiqueta"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? "Creando..." : "Crear Etiqueta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
