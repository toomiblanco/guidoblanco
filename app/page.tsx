import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { FeaturedNewsSection } from "@/components/featured-news-section"
import { LatestArticlesSection } from "@/components/latest-articles-section"
import { StatsSection } from "@/components/stats-section"

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturedNewsSection />
        <LatestArticlesSection />
        <StatsSection />
      </main>
    </div>
  )
}
