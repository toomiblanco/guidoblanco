import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { FeaturedNewsSection } from "@/components/featured-news-section"
import { LatestArticlesSection } from "@/components/latest-articles-section"
import { ContactSection } from "@/components/contact-section"
import { getIntervieweeNames } from "@/lib/database/queries"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Obtener nombres de entrevistados desde la base de datos
  let intervieweeNames: string[] = []
  try {
    intervieweeNames = await getIntervieweeNames()
  } catch (error) {
    console.error('Error fetching interviewee names:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection intervieweeNames={intervieweeNames} />
        <FeaturedNewsSection />
        <LatestArticlesSection />
        <ServicesSection />
        <ContactSection />
      </main>
    </div>
  )
}