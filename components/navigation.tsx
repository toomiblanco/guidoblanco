"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Si estamos en la página principal, hacer scroll suave
    if (pathname === '/') {
      e.preventDefault()
      const contactSection = document.getElementById('contacto')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
        setIsMenuOpen(false)
      }
    }
    // Si estamos en otra página, Next.js manejará la navegación a /#contacto
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-[100]">
      <div className="relative">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#1f201b] rounded-full"></div>
            <Link href="/" className="font-semibold text-sm tracking-wide text-[#1f201b] hover:text-[#6f706a] transition-colors">
              GUIDO BLANCO
            </Link>
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
                  <Link 
                    href="/" 
                    className="block px-4 py-2 text-[#1f201b] hover:bg-[#dadbd5]/50 transition-colors font-medium" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    INICIO
                  </Link>
                  <Link 
                    href="/noticias" 
                    className="block px-4 py-2 text-[#1f201b] hover:bg-[#dadbd5]/50 transition-colors font-medium" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    NOTICIAS
                  </Link>
                  <Link 
                    href="/sobre-mi" 
                    className="block px-4 py-2 text-[#1f201b] hover:bg-[#dadbd5]/50 transition-colors font-medium" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    SOBRE MÍ
                  </Link>
                  <Link 
                    href="/#contacto" 
                    className="block px-4 py-2 text-[#1f201b] hover:bg-[#dadbd5]/50 transition-colors font-medium" 
                    onClick={handleContactClick}
                  >
                    CONTACTO
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
