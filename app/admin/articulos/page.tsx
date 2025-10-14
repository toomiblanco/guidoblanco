import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { ArticlesTable } from "@/components/admin/articles-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getAllArticlesAdmin } from "@/lib/database/queries"

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    redirect("/auth/login")
  }

  let articles = []
  try {
    articles = await getAllArticlesAdmin()
  } catch (error) {
    console.error('Error fetching articles:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Artículos</h1>
              <p className="text-muted-foreground">Gestiona todos los artículos y noticias</p>
            </div>
            <Button asChild>
              <Link href="/admin/articulos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Artículo
              </Link>
            </Button>
          </div>
          <ArticlesTable articles={articles || []} />
        </div>
      </main>
    </div>
  )
}