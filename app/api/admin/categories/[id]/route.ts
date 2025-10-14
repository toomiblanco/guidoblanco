import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { updateCategory, deleteCategory } from '@/lib/database/queries'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, description, parent_id } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar que no se cree un ciclo (categoría no puede ser padre de sí misma)
    if (parent_id && parent_id === params.id) {
      return NextResponse.json(
        { error: 'Una categoría no puede ser padre de sí misma' },
        { status: 400 }
      )
    }

    // Generar slug automáticamente
    const slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const category = await updateCategory(params.id, {
      name,
      slug,
      description: description || null,
      parent_id: parent_id || null
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('❌ Error updating category:', error)

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

    await deleteCategory(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting category:', error)

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