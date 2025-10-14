"use client"

import { useRef, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Label } from '@/components/ui/label'

// Importar ReactQuill dinámicamente para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Escribe el contenido del artículo...",
  height = "400px"
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null)

  // Handler para subir imágenes
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede ser mayor a 5MB')
        return
      }

      // Crear FormData para subir la imagen
      const formData = new FormData()
      formData.append('image', file)

      try {
        // Mostrar indicador de carga
        const loadingToast = document.createElement('div')
        loadingToast.textContent = 'Subiendo imagen...'
        loadingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#007bff;color:white;padding:10px;border-radius:5px;z-index:9999'
        document.body.appendChild(loadingToast)

        // Subir imagen al servidor
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })

        // Remover indicador de carga
        document.body.removeChild(loadingToast)

        if (response.ok) {
          const data = await response.json()
          const imageUrl = data.url
          
          // Insertar imagen usando prompt (método compatible)
          const confirm = window.confirm(`¿Insertar imagen: ${file.name}?`)
          if (confirm) {
            // Obtener el editor actual (será configurado por Quill)
            const toolbar = document.querySelector('.ql-toolbar')
            const editor = toolbar?.nextElementSibling?.querySelector('.ql-editor')
            if (editor) {
              // Insertar imagen como HTML
              const img = document.createElement('img')
              img.src = imageUrl
              img.style.maxWidth = '100%'
              img.style.height = 'auto'
              
              // Insertar en la posición actual del cursor
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.insertNode(img)
                range.collapse(false)
              } else {
                editor.appendChild(img)
              }
            }
          }
        } else {
          const error = await response.json()
          alert(`Error al subir la imagen: ${error.error}`)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Error al subir la imagen')
      }
    }
  }

  // Configuración avanzada del editor
  // Función para limpiar contenido de Word (PRESERVANDO — para entrevistas)
  const cleanWordContent = (html: string): string => {
    // Eliminar metadatos de Microsoft Office
    let cleanHtml = html
      // Eliminar comentarios de Word
      .replace(/<!--[\s\S]*?-->/g, '')
      // Eliminar metadatos de Office
      .replace(/<o:p\s*\/?>|<\/o:p>/g, '')
      .replace(/<w:[^>]*>.*?<\/w:[^>]*>/g, '')
      // Eliminar estilos inline complejos de Word
      .replace(/style="[^"]*mso-[^"]*"/g, '')
      .replace(/style="[^"]*Microsoft[^"]*"/g, '')
      // Limpiar clases de Word
      .replace(/class="Mso[^"]*"/g, '')
      .replace(/class="Word[^"]*"/g, '')
      // Eliminar spans vacíos y elementos innecesarios
      .replace(/<span[^>]*><\/span>/g, '')
      .replace(/<font[^>]*>/g, '').replace(/<\/font>/g, '')
      // Normalizar espacios PERO MANTENER — (em dash) para entrevistas
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return cleanHtml
  }

  // Handler personalizado para pegar contenido
  const handlePaste = () => {
    // Retornar true para permitir que Quill maneje el pegado con nuestras configuraciones
    return true
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        // Formatos de texto
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        
        // Estilos de texto
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        
        // Párrafos y alineación
        [{ 'align': [] }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        
        // Listas
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        
        // Insertar elementos
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        
        // Utilidades
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      // Configuración mejorada para pegar desde Word/PDF
      matchVisual: false,
      // Procesar contenido pegado para limpiar estilos de Word
      matchers: [
        // Limpiar contenido de Word específicamente
        ['*', (node: any, delta: any) => {
          if (node.innerHTML) {
            node.innerHTML = cleanWordContent(node.innerHTML)
          }
          return delta
        }]
      ]
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  }), [])

  const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align',
    'code-block', 'script'
  ]

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Contenido del Artículo
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <div className="border rounded-lg overflow-hidden bg-white">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{
            minHeight: height
          }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>💡 Funcionalidades avanzadas:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Pega contenido directamente desde Word o PDF</li>
          <li>Usa el botón 📷 para subir imágenes</li>
          <li>Formatos: títulos, listas, enlaces, citas, código</li>
          <li>Atajos: Ctrl+B (negrita), Ctrl+I (cursiva), Ctrl+Z (deshacer)</li>
        </ul>
      </div>
    </div>
  )
}