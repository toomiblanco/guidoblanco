"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, ArrowRight, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export function HeroSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <section className="relative min-h-screen bg-[#dadbd5]">
      {/* Header integrated with page background */}
      <div className="absolute top-0 left-0 right-0 z-[100]">
        <div className="relative">
          <div className="container mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#1f201b] rounded-full"></div>
              <Link href="/" className="font-semibold text-sm tracking-wide text-[#1f201b] hover:text-[#6f706a] transition-colors">GUIDO BLANCO</Link>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-[#dadbd5]/80 backdrop-blur-sm border-[#6f706a] text-[#1f201b] hover:bg-[#1e1e1c] hover:text-[#dadbd5]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-4 w-4 mr-2" />
                MENÚ
              </Button>
              
              {/* Dropdown Menu positioned below button */}
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#6f706a]/20 z-[9999] overflow-hidden">
                  <div className="py-2">
                    <Link href="/noticias" className="block px-4 py-2 text-[#1f201b] hover:bg-[#dadbd5]/50 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                      NOTICIAS
                    </Link>
                    <Link href="/sobre-mi" className="block px-4 py-2 text-[#1f201b] hover:bg-[#dadbd5]/50 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                      SOBRE MÍ
                    </Link>
                    <Link href="/contacto" className="block px-4 py-2 text-[#1f201b] hover:bg-[#dadbd5]/50 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                      CONTACTO
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SVG clipPath definition */}
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="u-clip" clipPathUnits="objectBoundingBox">
            {/* U-shaped path with more rounded bottom - adjusted curve control points */}
            <path d="M0,0 H1 V0.7 C1 0.85 0.85 1 0.5 1 C0.15 1 0 0.85 0 0.7 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Profile Image starting from top of browser - creating U shape effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
        <div
          className="relative w-32 h-32 lg:w-115 lg:h-150 overflow-hidden"
          style={{
            WebkitClipPath: 'url(#u-clip)',
            clipPath: 'url(#u-clip)',
            filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.18))'
          }}
        >
          {/* Background behind the U-shape */}
          <div className="absolute inset-0 bg-[#dadbd5]" />
          
          {/* Next/Image with fill to cover the container */}
          <Image
            src="/professional-journalist-headshot--man-with-glasses.jpg"
            alt="Guido Blanco - Periodista y Comunicador"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Stats positioned more to the left - clean text only in 2x2 grid */}
      <div className="absolute top-72 right-32 z-30 hidden lg:block">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-[#1f201b]">15+</div>
            <div className="text-sm text-[#6f706a]">Años Experiencia</div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-[#1f201b]">280+</div>
            <div className="text-sm text-[#6f706a]">Proyectos Entregados</div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-[#1f201b]">+99%</div>
            <div className="text-sm text-[#6f706a]">Satisfacción Cliente</div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-[#1f201b]">50</div>
            <div className="text-sm text-[#6f706a]">Clientes worldwide</div>
          </div>
        </div>

<div className="container mx-auto px-20 pt-22 pb-16 relative z-20">

  <Button size="lg" className="group bg-[#1e1e1c] text-[#dadbd5] hover:bg-[#1f201b] rounded-full px-8" asChild>
              <Link href="/contacto">
                <Mail className="mr-2 h-4 w-4" />
                CONTACTAME
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
</div>

      </div>

      <div className="container mx-auto px-6 pt-32 pb-16 relative z-20">
        <div className="grid lg:grid-cols-3 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <p className="text-sm font-medium text-[#6f706a] uppercase tracking-wider">
                HOLA, SOY GUIDO BLANCO,
              </p>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-[#1f201b]">
               
                <span className="block">PERIODISTA</span>
                <span className="text-4xl lg:text-5xl font-light italic" >& Comunicador</span>
              </h1>
              
              <p className="text-lg text-[#6f706a] leading-relaxed max-w-xl">
                Transformando ideas en contenido impactante.<br />
                Periodismo y comunicación estratégica<br />
                que cautiva, conecta y genera<br />
                resultados extraordinarios.
              </p>
            </div>

          

          </div>

          {/* Right Content - Space for stats (shown on desktop) */}
          <div className="hidden lg:block">
            {/* Stats are positioned absolutely */}
          </div>
        </div>

        {/* Mobile stats - clean text only */}
        <div className="lg:hidden mt-12">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1f201b]">15+</div>
              <div className="text-sm text-[#6f706a]">Años Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1f201b]">280+</div>
              <div className="text-sm text-[#6f706a]">Proyectos Entregados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1f201b]">+99%</div>
              <div className="text-sm text-[#6f706a]">Satisfacción Cliente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1f201b]">50</div>
              <div className="text-sm text-[#6f706a]">Clientes worldwide</div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="pt-16">
          <div className="text-center mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6f706a] mb-6">
              TRUSTED BY
            </h3>
            <p className="text-sm text-[#6f706a] mb-8">
              Join 1,000 companies already building their websites with brandable
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 opacity-60">
            {[
              "Frame Blox", "Supa Blox", "Hype Blox", "Ultra Blox",
              "Ship Blox", "Frame Blox", "Ultra Blox", "Ship Blox"
            ].map((company, index) => (
              <div key={index} className="text-center py-4">
                <div className="text-sm font-medium text-[#6f706a]">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
