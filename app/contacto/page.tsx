"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Here you would typically send the form data to your backend
    // For now, we'll just simulate a submission
    setTimeout(() => {
      alert("Mensaje enviado correctamente. Te contactaré pronto.")
      setFormData({ name: "", email: "", subject: "", message: "" })
      setIsLoading(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-[#dadbd5]">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-left mb-12">
              <h1 className="text-5xl lg:text-6xl font-black text-[#1f201b] mb-4 uppercase tracking-tight">CONTACTO</h1>
              <p className="text-lg text-[#6f706a] max-w-2xl">
                ¿Tienes una historia que contar o necesitas servicios de comunicación? Hablemos.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Envíame un mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Tu nombre completo"
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
                          onChange={handleChange}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="¿De qué quieres hablar?"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Cuéntame más detalles sobre tu consulta..."
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      {isLoading ? "Enviando..." : "Enviar Mensaje"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">contacto@guidoblanco.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Teléfono</p>
                        <p className="text-sm text-muted-foreground">+54 11 1234-5678</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Ubicación</p>
                        <p className="text-sm text-muted-foreground">Buenos Aires, Argentina</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Servicios Disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Periodismo investigativo</li>
                      <li>• Consultoría en comunicación</li>
                      <li>• Análisis político</li>
                      <li>• Redacción editorial</li>
                      <li>• Entrevistas y reportajes</li>
                      <li>• Capacitación en medios</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tiempo de Respuesta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Respondo todos los mensajes dentro de las 24 horas. Para consultas urgentes, puedes contactarme
                      directamente por teléfono.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
