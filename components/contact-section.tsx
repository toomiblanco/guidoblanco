'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const phoneNumber = '5491154234781' // Mismo número que el botón WhatsApp

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Construir el mensaje de WhatsApp
    const whatsappMessage = `Hola Guido, soy ${formData.name}.

Email: ${formData.email}

Mensaje: ${formData.message}

(Enviado desde tu sitio web)`

    // Abrir WhatsApp con el mensaje
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(url, '_blank')

    // Limpiar el formulario
    setFormData({
      name: '',
      email: '',
      message: ''
    })
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              ¿Querés contactarte conmigo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Completá el formulario y te responderé por WhatsApp. Estoy disponible para proyectos, 
              entrevistas y colaboraciones.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                Enviar mensaje por WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Contame sobre tu proyecto, consulta o colaboración..."
                    rows={5}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  disabled={!formData.name || !formData.email || !formData.message}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar por WhatsApp
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Al enviar el formulario se abrirá WhatsApp con tu mensaje listo para enviar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}