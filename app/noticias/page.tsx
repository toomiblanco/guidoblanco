import { NewsGrid } from "@/components/news-grid"
import { NewsFilters } from "@/components/news-filters"
import { Header } from "@/components/header"
import { getAllArticles, getAllCategories, getAllTags } from "@/lib/database/queries"

export const dynamic = 'force-dynamic'

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; etiqueta?: string; buscar?: string }>
}) {
  const params = await searchParams
  
  let categories = []
  let tags = []
  let allArticles = []
  
  try {
    [categories, tags, allArticles] = await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllArticles()
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  // Filter articles based on search parameters
  let filteredArticles = allArticles

  if (params.categoria) {
    filteredArticles = filteredArticles.filter(article => 
      article.category_name?.toLowerCase() === params.categoria?.toLowerCase()
    )
  }

  if (params.buscar) {
    const searchTerm = params.buscar.toLowerCase()
    filteredArticles = filteredArticles.filter(article =>
      article.title?.toLowerCase().includes(searchTerm) ||
      article.summary?.toLowerCase().includes(searchTerm)
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Noticias</h1>
            <p className="text-muted-foreground">
              Mantente al día con las últimas noticias y análisis
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <NewsFilters 
                categories={categories || []} 
                tags={tags || []} 
                currentCategory={params.categoria}
                currentTag={params.etiqueta}
                currentSearch={params.buscar}
              />
            </div>
            <div className="lg:col-span-3">
              <NewsGrid articles={filteredArticles || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}