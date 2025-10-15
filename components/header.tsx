"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Si estamos en la página principal, hacer scroll suave
    if (pathname === '/') {
      e.preventDefault()
      const contactSection = document.getElementById('contacto')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
    // Si estamos en otra página, Next.js manejará la navegación a /#contacto
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#6f706a]/20 bg-[#dadbd5]/95 backdrop-blur supports-[backdrop-filter]:bg-[#dadbd5]/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/favicon.png"
                alt="Guido Blanco"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#1f201b] hover:text-[#1e1e1c] transition-colors">
              Inicio
            </Link>
            <Link href="/noticias" className="text-[#1f201b] hover:text-[#1e1e1c] transition-colors">
              Noticias
            </Link>
            <Link href="/sobre-mi" className="text-[#1f201b] hover:text-[#1e1e1c] transition-colors">
              Sobre Mí
            </Link>
            <Link 
              href="/#contacto" 
              className="text-[#1f201b] hover:text-[#1e1e1c] transition-colors"
              onClick={handleContactClick}
            >
              Contacto
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <Link
                href="/"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/noticias"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Noticias
              </Link>
              <Link
                href="/sobre-mi"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre Mí
              </Link>
              <Link
                href="/#contacto"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={(e) => {
                  handleContactClick(e)
                  setIsMenuOpen(false)
                }}
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
