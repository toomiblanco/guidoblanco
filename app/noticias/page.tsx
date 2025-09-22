import { createClient } from "@/lib/supabase/server"
import { NewsGrid } from "@/components/news-grid"
import { NewsFilters } from "@/components/news-filters"
import { Header } from "@/components/header"

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; etiqueta?: string; buscar?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories for filters
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Fetch tags for filters
  const { data: tags } = await supabase.from("tags").select("*").order("name")

  // Build query for articles
  let query = supabase
    .from("articles")
    .select(`
      *,
      categories (
        id,
        name,
        slug
      ),
      article_tags (
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  // Apply filters
  if (params.categoria) {
    query = query.eq("categories.slug", params.categoria)
  }

  if (params.buscar) {
    query = query.or(`title.ilike.%${params.buscar}%,summary.ilike.%${params.buscar}%`)
  }

  const { data: articles } = await query

  return (
    <div className="min-h-screen bg-[#dadbd5]">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-left">
            <h1 className="text-5xl lg:text-6xl font-black text-[#1f201b] mb-4 uppercase tracking-tight">NOTICIAS Y ARTÍCULOS</h1>
            <p className="text-lg text-[#6f706a] max-w-2xl">
              Análisis, investigaciones y reportajes sobre los temas que marcan la actualidad
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <NewsFilters
                categories={categories || []}
                tags={tags || []}
                currentCategory={params.categoria}
                currentTag={params.etiqueta}
                currentSearch={params.buscar}
              />
            </div>

            {/* Articles Grid */}
            <div className="lg:col-span-3">
              <NewsGrid articles={articles || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
