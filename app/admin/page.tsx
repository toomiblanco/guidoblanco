import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { ArticlesTable } from "@/components/admin/articles-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function AdminArticlesPage() {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Fetch articles
  const { data: articles } = await supabase
    .from("articles")
    .select(
      `
      *,
      categories (
        name
      )
    `,
    )
    .order("created_at", { ascending: false })

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
