import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { ArticleEditor } from "@/components/admin/article-editor"

export default async function NewArticlePage() {
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

  // Fetch categories and tags for the editor
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
  ])

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Nuevo Artículo</h1>
            <p className="text-muted-foreground">Crea un nuevo artículo o noticia</p>
          </div>

          <ArticleEditor categories={categories || []} tags={tags || []} />
        </div>
      </main>
    </div>
  )
}
