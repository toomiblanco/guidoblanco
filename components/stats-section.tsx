import { Card } from "@/components/ui/card"

const stats = [
  {
    number: "15+",
    label: "Años de Experiencia",
    description: "En periodismo y comunicación",
  },
  {
    number: "500+",
    label: "Artículos Publicados",
    description: "En medios nacionales",
  },
  {
    number: "98%",
    label: "Precisión Editorial",
    description: "En investigaciones",
  },
  {
    number: "25",
    label: "Premios Obtenidos",
    description: "Reconocimientos profesionales",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-[#dadbd5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center border-0 shadow-sm hover:shadow-md transition-shadow bg-white/50 hover:bg-white/70">
              <div className="space-y-2">
                <div className="text-3xl lg:text-4xl font-bold text-[#1e1e1c]">{stat.number}</div>
                <div className="text-sm font-semibold text-[#1f201b]">{stat.label}</div>
                <div className="text-xs text-[#6f706a]">{stat.description}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
