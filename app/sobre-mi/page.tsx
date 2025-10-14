import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, Users, Globe } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const achievements = [
    {
      icon: Award,
      title: "Premio Nacional de Periodismo",
      year: "2023",
      description: "Reconocimiento por excelencia en periodismo investigativo",
    },
    {
      icon: BookOpen,
      title: "Autor de 3 Libros",
      year: "2020-2024",
      description: "Publicaciones sobre comunicación y análisis político",
    },
    {
      icon: Users,
      title: "Conferencias Internacionales",
      year: "2019-2024",
      description: "Ponente en más de 50 eventos sobre periodismo",
    },
    {
      icon: Globe,
      title: "Corresponsal Internacional",
      year: "2018-2022",
      description: "Cobertura de eventos políticos en Latinoamérica",
    },
  ]

  const skills = [
    "Periodismo Investigativo",
    "Análisis Político",
    "Comunicación Estratégica",
    "Redacción Editorial",
    "Entrevistas",
    "Fact-checking",
    "Multimedia",
    "Redes Sociales",
  ]

  return (
    <div className="min-h-screen bg-[#dadbd5]">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-black text-[#1f201b] uppercase tracking-tight">SOBRE MÍ</h1>
                <p className="text-lg text-[#6f706a] leading-relaxed">
                  Soy Guido Blanco, periodista argentino formado en la Universidad Nacional de La Matanza (UNLaM). Desde Buenos Aires construyo mi camino en el periodismo cultural a través de entrevistas que buscan mucho más que preguntas y respuestas: diálogos que inspiran, emocionan y dejan huella.
                </p>
                <p className="text-lg text-[#6f706a] leading-relaxed">
                  Tuve el privilegio de conversar con figuras icónicas del cine, la música y la televisión, artistas premiados con Óscars, Grammys, Emmys, Tonys y Globos de Oro, y reconocidos en el Paseo de la Fama de Hollywood. Mi estilo se caracteriza por la profundidad, la empatía y la curiosidad, cuidando cada etapa del proceso, desde la investigación y la realización hasta la edición y traducción.
                </p>
                <p className="text-lg text-[#6f706a] leading-relaxed">
                  Me identifican el amor por lo clásico y la fascinación por la cultura pop, queer y camp, pero sobre todo me mueve la interés constante: la posibilidad de descubrir nuevas miradas y compartir historias que preservan la memoria cultural mientras generan un puente entre artistas, medios y audiencias.
                </p>
              </div>
              <div className="relative">
                <div className="relative w-80 h-80 mx-auto lg:w-96 lg:h-96">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg"></div>
                  <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-background shadow-2xl">
                    <Image
                      src="/professional-journalist-headshot--man-with-glasses.jpg"
                      alt="Guido Blanco - Periodista y Comunicador"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Logros y Reconocimientos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {achievement.year}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Skills */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Áreas de Especialización</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="px-4 py-2 text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="text-center">
            <Card className="max-w-2xl mx-auto border-0 shadow-sm bg-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">¿Interesado en colaborar?</h2>
                <p className="text-muted-foreground mb-6">
                  Estoy disponible para proyectos de periodismo, consultoría en comunicación y colaboraciones
                  editoriales.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:contacto@guidoblanco.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                  >
                    Contactar por Email
                  </a>
                  <a
                    href="https://linkedin.com/in/guidoblanco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-md font-medium hover:bg-muted transition-colors"
                  >
                    Ver LinkedIn
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
