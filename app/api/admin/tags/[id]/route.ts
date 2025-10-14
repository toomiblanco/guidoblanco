import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { updateTag, deleteTag } from '@/lib/database/queries'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
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

    const tag = await updateTag(params.id, {
      name,
      slug
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('❌ Error updating tag:', error)

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

    await deleteTag(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting tag:', error)

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