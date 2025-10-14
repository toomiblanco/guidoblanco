import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { TagsTable } from "@/components/admin/tags-table"
import { getAllTags } from "@/lib/database/queries"

export const dynamic = 'force-dynamic'

export default async function AdminTagsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user?.role !== 'admin') {
    redirect("/")
  }

  let tags = []
  try {
    tags = await getAllTags()
  } catch (error) {
    console.error('Error fetching tags:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Etiquetas</h1>
            <p className="text-muted-foreground">Gestiona las etiquetas de los artículos</p>
          </div>

          <TagsTable tags={tags || []} />
        </div>
      </main>
    </div>
  )
}