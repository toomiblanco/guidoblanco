"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, FileText, FolderOpen, Tag, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Artículos", href: "/admin/articulos", icon: FileText },
  { name: "Categorías", href: "/admin/categorias", icon: FolderOpen },
  { name: "Etiquetas", href: "/admin/etiquetas", icon: Tag },
]

export function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/admin" className="text-xl font-bold text-primary">
              ADMIN - GUIDO BLANCO
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ver Sitio
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
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
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Ver Sitio
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
