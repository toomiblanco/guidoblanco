import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createArticle, getAllArticlesAdmin } from '@/lib/database/queries'

export async function GET() {
  try {
    // Validar que el usuario es admin
    await requireAdmin()

    const articles = await getAllArticlesAdmin()
    return NextResponse.json(articles)
  } catch (error) {
    console.error('❌ Error fetching articles:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validar que el usuario es admin
    const user = await requireAdmin()

    const body = await request.json()
    const { tags, author_email, ...articleData } = body

    console.log('📝 Creating article with data:', { 
      title: articleData.title,
      slug: articleData.slug,
      author_email: author_email || user.email,
      category_id: articleData.category_id,
      tags: tags
    })

    // Validar campos requeridos
    if (!articleData.title || !articleData.slug || !articleData.content) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, slug, content' },
        { status: 400 }
      )
    }

    // Crear artículo con el email del usuario autenticado
    const article = await createArticle(articleData, tags, author_email || user.email)

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating article:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    )
  }
}