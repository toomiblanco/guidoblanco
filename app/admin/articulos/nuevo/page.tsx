import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AdminHeader } from '@/components/admin/admin-header'
import { ArticleEditor } from '@/components/admin/article-editor'
import { getAllCategories, getAllTags } from '@/lib/database/queries'

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  const [categories, tags] = await Promise.all([
    getAllCategories(),
    getAllTags()
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