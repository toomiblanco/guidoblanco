import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/auth-helpers'
import { createTag } from '@/lib/database/queries'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [create-batch] Solicitud recibida')
    
    const user = await requireAdmin()
    
    if (!user) {
      console.log('❌ [create-batch] Usuario no autorizado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('✅ [create-batch] Usuario autorizado:', user.email)

    const { tagNames } = await request.json()
    console.log('📝 [create-batch] Nombres de etiquetas recibidos:', tagNames)

    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de nombres de etiquetas' }, { status: 400 })
    }

    // Validar que no haya más de 10 etiquetas
    if (tagNames.length > 10) {
      return NextResponse.json({ error: 'Máximo 10 etiquetas por vez' }, { status: 400 })
    }

    // Validar que cada nombre tenga entre 1 y 50 caracteres
    for (const name of tagNames) {
      if (typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
        return NextResponse.json({ 
          error: 'Cada etiqueta debe tener entre 1 y 50 caracteres' 
        }, { status: 400 })
      }
    }

    // Crear las etiquetas una por una
    const createdTags = []
    const errors = []
    
    console.log('🏗️ [create-batch] Iniciando creación de etiquetas...')
    
    for (const tagName of tagNames) {
      try {
        console.log(`📝 [create-batch] Creando etiqueta: "${tagName}"`)
        
        // Generar slug para la etiqueta
        const slug = tagName.trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        
        const tag = await createTag({ 
          name: tagName.trim(),
          slug: slug
        })
        console.log(`✅ [create-batch] Etiqueta creada exitosamente:`, tag)
        createdTags.push(tag)
      } catch (error: any) {
        console.error(`❌ [create-batch] Error creating tag "${tagName}":`, error)
        errors.push(`Error creando "${tagName}": ${error.message || 'Error desconocido'}`)
      }
    }

    console.log('🎉 [create-batch] Proceso completado. Creadas:', createdTags.length, 'Errores:', errors.length)

    return NextResponse.json({ 
      success: true, 
      tags: createdTags,
      errors: errors,
      message: `${createdTags.length} etiqueta(s) creada(s) exitosamente${errors.length > 0 ? ` (${errors.length} error(es))` : ''}`
    })

  } catch (error) {
    console.error('Error creating tags:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}