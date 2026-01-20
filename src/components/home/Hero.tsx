import { Button } from "@/components/ui/Button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-6 text-balance">
          Masterpieces of <span className="text-primary italic">Your Pet</span>
        </h1>
        <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto text-balance">
          Transform your furry friend into timeless digital art. 
          Museum-quality AI portraits, generated instantly.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8 text-lg">
              Explore Gallery
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative background blur blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-stone-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
    </section>
  )
}
