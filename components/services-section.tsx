import { Card, CardContent } from "@/components/ui/card"
import { Newspaper, Users, Search, Megaphone } from "lucide-react"

const services = [
  {
    icon: Newspaper,
    title: "Periodismo Investigativo",
    description: "Investigación profunda y análisis riguroso de temas de interés público con fuentes verificadas.",
  },
  {
    icon: Users,
    title: "Comunicación Estratégica",
    description: "Desarrollo de estrategias comunicacionales efectivas para organizaciones y figuras públicas.",
  },
  {
    icon: Search,
    title: "Análisis Político",
    description: "Cobertura especializada y análisis experto de la actualidad política nacional e internacional.",
  },
  {
    icon: Megaphone,
    title: "Consultoría Editorial",
    description: "Asesoramiento editorial y desarrollo de contenidos para medios digitales y tradicionales.",
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 bg-[#dadbd5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-16">
          <h2 className="text-5xl lg:text-6xl font-black text-[#1f201b] mb-4 uppercase tracking-tight">ÁREAS DE ESPECIALIZACIÓN</h2>
          <p className="text-lg text-[#6f706a] max-w-2xl">
            Servicios profesionales especializados en periodismo y comunicación estratégica
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/50 hover:bg-white/70"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#1e1e1c]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-6 w-6 text-[#1e1e1c]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1f201b] mb-3">{service.title}</h3>
                <p className="text-sm text-[#6f706a] leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
