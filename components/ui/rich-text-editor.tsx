"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'

// Importar React Quill dinámicamente para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-md" />
})

// Importar CSS de Quill
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe el contenido del artículo aquí...",
  className = ""
}) => {
  // Configuración avanzada de la barra de herramientas para periodistas
  const modules = useMemo(() => ({
    toolbar: [
      // Formato de texto básico
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      
      // Formato de caracteres
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      
      // Párrafos y listas
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      
      // Elementos multimedia y especiales
      ['blockquote', 'code-block'],
      ['link', 'image'],
      
      // Utilidades
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true
    }
  }), [])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'code-block',
    'script',
    'clean'
  ]

  return (
    <div className={`rich-text-editor ${className}`}>
      <style jsx global>{`
        .ql-editor {
          min-height: 400px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: none;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
        }
        
        /* Estilo para citas */
        .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          margin: 16px 0;
          padding-left: 16px;
          font-style: italic;
        }
        
        /* Estilo para código */
        .ql-editor code {
          background-color: #f3f4f6;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .ql-editor pre {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 0.375rem;
          padding: 16px;
          overflow-x: auto;
        }
        
        /* Estilo para enlaces */
        .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ql-editor a:hover {
          color: #1d4ed8;
        }
        
        /* Estilo para imágenes */
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 8px 0;
        }
        
        /* Estilo para listas */
        .ql-editor ul, .ql-editor ol {
          padding-left: 1.5rem;
        }
        
        .ql-editor li {
          margin-bottom: 0.25rem;
        }
        
        /* Botones de la barra de herramientas */
        .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        
        .ql-toolbar .ql-picker-label:hover,
        .ql-toolbar .ql-picker-item:hover,
        .ql-toolbar button:hover {
          color: #3b82f6;
        }
        
        .ql-toolbar .ql-active {
          color: #3b82f6 !important;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .ql-toolbar {
            border-radius: 0.375rem 0.375rem 0 0;
          }
          
          .ql-toolbar .ql-formats {
            margin-right: 8px;
          }
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}

export default RichTextEditor
