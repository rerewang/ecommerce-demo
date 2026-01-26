import Link from "next/link"
import Image from "next/image"
import { ReactNode } from "react"

const STYLES = [
  { 
    id: 'oil', 
    color: 'bg-amber-100',
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'cyber', 
    color: 'bg-purple-100',
    img: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: '3d', 
    color: 'bg-blue-100',
    img: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80'
  },
]

interface StyleCategoriesProps {
  title: ReactNode
  viewAll: string
  styleTranslations: Record<string, { name: string; description: string }>
}

export function StyleCategories({ title, viewAll, styleTranslations }: StyleCategoriesProps) {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-stone-100 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">
              {title}
            </h2>
          </div>
          <Link href="/products" className="text-primary hover:text-primary-700 font-medium hidden md:block">
            {viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STYLES.map((style) => {
            const t = styleTranslations[style.id]
            return (
              <Link 
                key={style.id} 
                href={`/products?query=${style.id}`} 
                className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
              >
                <Image 
                  src={style.img} 
                  alt={t.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <h3 className="text-2xl font-serif mb-2">{t.name}</h3>
                  <p className="text-stone-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {t.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
