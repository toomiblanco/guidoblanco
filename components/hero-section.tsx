"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, ArrowRight, Menu, X, ArrowDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface HeroSectionProps {
  intervieweeNames?: string[]
}

export function HeroSection({ intervieweeNames = [] }: HeroSectionProps) {
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
                Periodismo con mirada propia: contenidos que informan, inspiran y dejan huella.
              </p>
            </div>

            {/* Scroll down button - dentro del contenido izquierdo */}
            <div className="flex justify-start pt-8">
              <button 
                onClick={() => {
                  const nextSection = document.querySelector('#artistas-entrevistados');
                  if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group flex flex-col items-center space-y-2 p-4 hover:bg-white/10 rounded-full transition-all duration-300"
              >
                <div className="text-xs text-[#6f706a] font-medium tracking-wide">EXPLORAR</div>
                <div className="w-6 h-6 border-2 border-[#6f706a] rounded-full flex items-center justify-center group-hover:border-[#1f201b] transition-colors">
                  <ArrowDown className="w-3 h-3 text-[#6f706a] group-hover:text-[#1f201b] transition-all transform group-hover:translate-y-0.5" />
                </div>
              </button>
            </div>

          </div>

          {/* Right Content - Professional highlights */}
          <div className="hidden lg:block space-y-8">
            {/* Professional highlights */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[#1f201b] mb-4">Especialidades</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#1f201b] rounded-full"></div>
                    <span className="text-sm text-[#6f706a]">Entrevistas Culturales</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#1f201b] rounded-full"></div>
                    <span className="text-sm text-[#6f706a]">Periodismo Internacional</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#1f201b] rounded-full"></div>
                    <span className="text-sm text-[#6f706a]">Producción Integral</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#1f201b] rounded-full"></div>
                    <span className="text-sm text-[#6f706a]">Cultura Pop & Clásica</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Awards highlight */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1f201b]">🏆</div>
                <p className="text-sm text-[#6f706a] mt-2">
                  Entrevistas con artistas premiados con Óscars, Grammys, Emmys y Globos de Oro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {/* Trusted By Section */}
        <div id="artistas-entrevistados" className="pt-8">
          <div className="text-center mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6f706a] mb-6">
              ARTISTAS ENTREVISTADOS
            </h3>
            <p className="text-sm text-[#6f706a] mb-8">
              Figuras icónicas del cine, la música y la televisión que han confiado en mi trabajo
            </p>
          </div>
          
          {/* Scrolling artist names */}
          <div className="relative overflow-hidden">
            {intervieweeNames.length > 0 ? (
              <div className="flex animate-scroll space-x-8">
                {intervieweeNames.map((artist, index) => (
                  <div key={index} className="flex-shrink-0 text-center py-4">
                    <div className="text-sm font-medium text-[#6f706a] whitespace-nowrap">
                      {artist.toUpperCase()}
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless scroll */}
                {intervieweeNames.map((artist, index) => (
                  <div key={`duplicate-${index}`} className="flex-shrink-0 text-center py-4">
                    <div className="text-sm font-medium text-[#6f706a] whitespace-nowrap">
                      {artist.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-[#6f706a] opacity-60">
                  Próximamente: nombres de artistas entrevistados
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
