import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Eye, Edit, FolderOpen } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    totalCategories: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Artículos",
      value: stats.totalArticles,
      icon: FileText,
      description: "Artículos en total",
    },
    {
      title: "Publicados",
      value: stats.publishedArticles,
      icon: Eye,
      description: "Artículos publicados",
    },
    {
      title: "Borradores",
      value: stats.draftArticles,
      icon: Edit,
      description: "Artículos en borrador",
    },
    {
      title: "Categorías",
      value: stats.totalCategories,
      icon: FolderOpen,
      description: "Categorías creadas",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
