import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { updateArticle, getArticleById, deleteArticle } from '@/lib/database/queries'
import { query } from '@/lib/database/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const article = await getArticleById(params.id)

    if (!article) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('❌ Error fetching article:', error)

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { tags, ...articleData } = body

    // Actualizar artículo
    const article = await updateArticle(params.id, articleData)

    // Actualizar tags
    if (tags !== undefined) {
      // Eliminar tags existentes
      await query('DELETE FROM article_tags WHERE article_id = $1', [params.id])

      // Agregar nuevos tags
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagId of tags) {
          await query(`
            INSERT INTO article_tags (article_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT (article_id, tag_id) DO NOTHING
          `, [params.id, tagId])
        }
      }
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('❌ Error updating article:', error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const deleted = await deleteArticle(params.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting article:', error)

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