import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Globe, Briefcase, GraduationCap } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const achievements = [
    {
      icon: User,
      title: "Perfil Profesional",
      year: "",
      description: "Persona proactiva, responsable y flexible ante los cambios, con gran disposición para el trabajo en equipo. Me caracterizan la creatividad, el liderazgo, la resolución de problemas y la orientación a resultados. Abierto al aprendizaje continuo en búsqueda de un crecimiento constante como profesional.",
    },
    {
      icon: Globe,
      title: "Idiomas",
      year: "",
      description: "Español nativo, Inglés avanzado, Portugués básico",
    },
    {
      icon: Briefcase,
      title: "Habilidades",
      year: "",
      description: "Paquete de Microsoft Office • Gestión de redes sociales • Edición de video (Adobe Premiere Pro) • Edición de audio (Audacity) • Storytelling • Redacción periodística",
    },
    {
      icon: GraduationCap,
      title: "Cursos y Capacitaciones",
      year: "",
      description: "Curso de Periodismo sobre Cine — TEA (2022).\n\nCurso de Storytelling en el Marketing Digital — Santander Open Academy y The University of Chicago (2025)",
    },
  ]

  const skills = [
    "Periodismo Investigativo",
    "Comunicación Estratégica",
    "Entrevistas",
    "Fact-checking",
    "Medios y cultura",
    "Storytelling",
    "Redacción periodística",
  ]

  return (
    <div className="min-h-screen bg-[#dadbd5]">
      <div className="relative">
        <Navigation />
        <main className="py-12 pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-black text-[#1f201b] uppercase tracking-tight">SOBRE MÍ</h1>
                <p className="text-lg text-[#6f706a] leading-relaxed">
                  Soy Guido Blanco, Técnico Universitario en Periodismo por la Universidad Nacional de La Matanza (UNLaM). Desde Buenos Aires construyo mi camino en el periodismo cultural a través de entrevistas que buscan mucho más que preguntas y respuestas: diálogos que inspiran, emocionan y dejan huella.
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
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Perfil y Competencias</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                            {achievement.year && (
                              <Badge variant="secondary" className="text-xs">
                                {achievement.year}
                              </Badge>
                            )}
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
            <Card className="max-w-2xl mx-auto border-0 shadow-sm bg-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">¿Interesado en colaborar?</h2>
                <p className="text-muted-foreground mb-6">
                  Estoy disponible para proyectos de periodismo, consultoría en comunicación y colaboraciones
                  editoriales.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
               
                  <a
                    href="https://www.linkedin.com/in/guido-blanco-044799249/"
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
    </div>
  )
}
