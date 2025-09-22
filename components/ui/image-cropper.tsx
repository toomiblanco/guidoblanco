"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Crop, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react'

interface ImageCropperProps {
  imageUrl: string
  isOpen: boolean
  onClose: () => void
  onSave: (croppedImageUrl: string) => void
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  isOpen,
  onClose,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  // Dimensiones del área de recorte visual (16:9 aspect ratio)
  const previewCropWidth = 400
  const previewCropHeight = 225
  
  // Dimensiones de salida de alta resolución (16:9 aspect ratio)
  const outputWidth = 1200  // 3x más grande para mejor calidad
  const outputHeight = 675

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calcular dimensiones escaladas de la imagen
    const scaledWidth = image.naturalWidth * scale
    const scaledHeight = image.naturalHeight * scale

    // Dibujar la imagen con escala y posición
    ctx.drawImage(
      image,
      position.x - scaledWidth / 2,
      position.y - scaledHeight / 2,
      scaledWidth,
      scaledHeight
    )

    // Dibujar máscara oscura
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Limpiar el área de recorte
    ctx.globalCompositeOperation = 'destination-out'
    const cropX = (canvas.width - previewCropWidth) / 2
    const cropY = (canvas.height - previewCropHeight) / 2
    ctx.fillRect(cropX, cropY, previewCropWidth, previewCropHeight)

    // Restaurar modo de composición
    ctx.globalCompositeOperation = 'source-over'

    // Dibujar borde del área de recorte
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(cropX, cropY, previewCropWidth, previewCropHeight)
  }, [scale, position, imageLoaded])

  React.useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleImageLoad = () => {
    const image = imageRef.current
    const canvas = canvasRef.current
    if (!image || !canvas) return

    setImageLoaded(true)
    
    // Centrar la imagen inicialmente
    setPosition({ x: canvas.width / 2, y: canvas.height / 2 })
    
    // Calcular escala inicial para que la imagen llene el área de recorte
    const scaleX = previewCropWidth / image.naturalWidth
    const scaleY = previewCropHeight / image.naturalHeight
    const initialScale = Math.max(scaleX, scaleY)
    setScale(initialScale)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleReset = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    setPosition({ x: canvas.width / 2, y: canvas.height / 2 })
    const scaleX = previewCropWidth / image.naturalWidth
    const scaleY = previewCropHeight / image.naturalHeight
    const initialScale = Math.max(scaleX, scaleY)
    setScale(initialScale)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    // Crear canvas para el resultado final en alta resolución
    const resultCanvas = document.createElement('canvas')
    resultCanvas.width = outputWidth
    resultCanvas.height = outputHeight
    const ctx = resultCanvas.getContext('2d')
    if (!ctx) return

    // Mejorar la calidad de renderizado
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Calcular la posición de recorte en el canvas original
    const cropX = (canvas.width - previewCropWidth) / 2
    const cropY = (canvas.height - previewCropHeight) / 2

    // Calcular dimensiones escaladas de la imagen
    const scaledWidth = image.naturalWidth * scale
    const scaledHeight = image.naturalHeight * scale

    // Calcular el factor de escala para la salida de alta resolución
    const outputScale = outputWidth / previewCropWidth

    // Dibujar solo la parte recortada en alta resolución
    ctx.drawImage(
      image,
      // Coordenadas de origen en la imagen original
      ((cropX - position.x + scaledWidth / 2) / scale),
      ((cropY - position.y + scaledHeight / 2) / scale),
      (previewCropWidth / scale),
      (previewCropHeight / scale),
      // Coordenadas de destino en el canvas resultado
      0,
      0,
      outputWidth,
      outputHeight
    )

    // Convertir a data URL con mayor calidad
    const croppedImageUrl = resultCanvas.toDataURL('image/jpeg', 0.95)
    onSave(croppedImageUrl)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajustar Imagen de Portada</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Recorte en proporción 16:9 (salida: 1200x675px) - Arrastra para reposicionar, usa el slider para hacer zoom
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden bg-gray-100 flex justify-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={300}
              className="cursor-move max-w-full h-auto"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Original"
              className="hidden"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Zoom</Label>
              <div className="flex items-center space-x-2">
                <ZoomOut className="h-4 w-4" />
                <Slider
                  value={[scale]}
                  onValueChange={([value]) => setScale(value)}
                  min={0.1}
                  max={3}
                  step={0.01}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Move className="h-4 w-4" />
              <span>Arrastra la imagen para reposicionarla</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Crop className="h-4 w-4 mr-2" />
              Aplicar Recorte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}