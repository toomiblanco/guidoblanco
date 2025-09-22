import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { CategoriesTable } from "@/components/admin/categories-table"
import { CreateCategoryForm } from "@/components/admin/create-category-form"

export default async function AdminCategoriesPage() {
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

  // Fetch categories with hierarchical structure
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_id, created_at")
    .order("name")

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
            <p className="text-muted-foreground">Gestiona las categorías de los artículos</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CategoriesTable categories={categories || []} />
            </div>
            <div className="lg:col-span-1">
              <CreateCategoryForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
