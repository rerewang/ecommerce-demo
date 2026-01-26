import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Check } from "lucide-react"
import { ReactNode } from "react"

interface HeroProps {
  title: ReactNode
  subtitle: string
  cta: string
  features: {
    instant: string
    quality: string
    unique: string
  }
}

export function Hero({ title, subtitle, cta, features }: HeroProps) {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-foreground mb-6 text-balance tracking-tight leading-[1.1]">
          {title}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          {subtitle}
        </p>

        <ul className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-10 text-stone-600 justify-center">
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <span>{features.instant}</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <span>{features.quality}</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <span>{features.unique}</span>
          </li>
        </ul>

        <div className="w-full sm:w-auto">
          <Link href="/products" className="block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-xl px-10 py-6 text-lg bg-cta hover:bg-cta/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              {cta}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative background blur blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
    </section>
  )
}
