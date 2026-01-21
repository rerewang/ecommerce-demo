import { Hero } from "@/components/home/Hero"
import { FeaturedGallery } from "@/components/home/FeaturedGallery"
import { StyleCategories } from "@/components/home/StyleCategories"
import { HowItWorks } from "@/components/home/HowItWorks"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <StyleCategories />
      <FeaturedGallery />
    </div>
  )
}
