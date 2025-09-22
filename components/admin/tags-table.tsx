"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

interface TagsTableProps {
  tags: Tag[]
}

export function TagsTable({ tags }: TagsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Etiquetas Existentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-1 bg-muted rounded-lg p-2">
              <Badge variant="outline">{tag.name}</Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          {tags.length === 0 && (
            <p className="text-center text-muted-foreground py-8 w-full">No hay etiquetas creadas</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
