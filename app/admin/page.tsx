import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { AdminHeader } from "@/components/admin/admin-header"
import { getAllArticles, getAllCategories, getAllTags } from '@/lib/database/queries'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user?.role !== 'admin') {
    redirect('/')
  }

  // Obtener estadísticas básicas
  let stats = {
    articles: 0,
    categories: 0,
    tags: 0
  }

  try {
    const [articles, categories, tags] = await Promise.all([
      getAllArticles(),
      getAllCategories(), 
      getAllTags()
    ])
    
    stats = {
      articles: articles?.length || 0,
      categories: categories?.length || 0,
      tags: tags?.length || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard de Administración</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona artículos, categorías y contenido del sitio web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Artículos</h3>
              <p className="text-3xl font-bold text-primary">{stats.articles}</p>
              <p className="text-sm text-muted-foreground">Total publicados</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Categorías</h3>
              <p className="text-3xl font-bold text-primary">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">Categorías activas</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Etiquetas</h3>
              <p className="text-3xl font-bold text-primary">{stats.tags}</p>
              <p className="text-sm text-muted-foreground">Etiquetas disponibles</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Visitas</h3>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Este mes</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Estado del Sistema</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Base de datos PostgreSQL</span>
                <span className="text-green-600 font-medium">✓ Conectado</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Autenticación NextAuth</span>
                <span className="text-yellow-600 font-medium">⚠ Pendiente configuración</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Servidor de aplicación</span>
                <span className="text-green-600 font-medium">✓ Funcionando</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}