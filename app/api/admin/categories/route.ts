import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { getAllCategories, createCategory } from '@/lib/database/queries'

export async function GET() {
  try {
    // Las categorías son públicas, no requieren autenticación
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Generar slug automáticamente
    const slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const category = await createCategory({
      name,
      slug,
      description: description || null,
      parent_id: parent_id || null
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating category:', error)

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