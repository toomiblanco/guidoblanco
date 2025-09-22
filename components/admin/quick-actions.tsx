import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, FolderOpen, Tag } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Nuevo Artículo",
      description: "Crear un nuevo artículo",
      href: "/admin/articulos/nuevo",
      icon: FileText,
    },
    {
      title: "Nueva Categoría",
      description: "Agregar una categoría",
      href: "/admin/categorias",
      icon: FolderOpen,
    },
    {
      title: "Nueva Etiqueta",
      description: "Crear una etiqueta",
      href: "/admin/etiquetas",
      icon: Tag,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button key={index} asChild variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                <Link href={action.href}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
