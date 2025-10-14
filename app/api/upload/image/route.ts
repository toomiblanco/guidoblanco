import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ Upload image request received')
    
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      console.log('❌ No file received')
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      )
    }

    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json(
        { error: 'La imagen no puede ser mayor a 5MB' },
        { status: 400 }
      )
    }

    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images')
    console.log('📂 Uploads directory:', uploadsDir)
    
    if (!existsSync(uploadsDir)) {
      console.log('📁 Creating uploads directory...')
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `image-${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    console.log('💾 Saving file to:', filePath)

    // Convertir archivo a buffer y guardarlo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log('✅ File saved successfully')

    // Retornar URL pública de la imagen
    const imageUrl = `/uploads/images/${fileName}`
    
    console.log('🌐 Image URL:', imageUrl)
    
    return NextResponse.json({
      url: imageUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('❌ Error uploading image:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}