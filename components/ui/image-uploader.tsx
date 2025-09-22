"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImageUploaderProps {
  onImageInsert: (imageUrl: string) => void
  children?: React.ReactNode
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageInsert, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamaño del archivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.')
      return
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.')
      return
    }

    setUploading(true)
    
    try {
      // Importar Supabase client dinámicamente
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `images/${fileName}`

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('articles')
        .upload(filePath, file)

      if (error) {
        throw error
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('articles')
        .getPublicUrl(filePath)

      onImageInsert(publicUrlData.publicUrl)
      setIsOpen(false)
    } catch (error) {
      console.error('Error uploading image:', error)
      // Fallback a base64 si falla la subida a Supabase
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageInsert(result)
        setIsOpen(false)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlInsert = () => {
    if (imageUrl.trim()) {
      onImageInsert(imageUrl.trim())
      setImageUrl('')
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Insertar Imagen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insertar Imagen</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivo
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              URL de Imagen
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Seleccionar imagen</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                disabled={uploading}
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Subiendo imagen...
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Formatos soportados: JPG, PNG, GIF, WebP (máx. 5MB)
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL de la imagen</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleUrlInsert} 
              disabled={!imageUrl.trim()}
              className="w-full"
            >
              Insertar Imagen
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ImageUploader
