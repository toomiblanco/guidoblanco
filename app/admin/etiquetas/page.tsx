import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { TagsTable } from "@/components/admin/tags-table"
import { CreateTagForm } from "@/components/admin/create-tag-form"

export default async function AdminTagsPage() {
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

  // Fetch tags
  const { data: tags } = await supabase.from("tags").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Etiquetas</h1>
            <p className="text-muted-foreground">Gestiona las etiquetas de los artículos</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TagsTable tags={tags || []} />
            </div>
            <div className="lg:col-span-1">
              <CreateTagForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
