import Link from "next/link"
import Image from "next/image"

const STYLES = [
  { 
    id: 'oil', 
    name: 'Classic Oil', 
    description: 'Renaissance style portraits',
    color: 'bg-amber-100',
    img: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=600&fit=crop' 
  },
  { 
    id: 'cyber', 
    name: 'Cyberpunk', 
    description: 'Neon lights and chrome',
    color: 'bg-purple-100',
    img: 'https://images.unsplash.com/photo-1535378437326-971029110397?w=400&h=600&fit=crop'
  },
  { 
    id: '3d', 
    name: '3D Pixar', 
    description: 'Cute animated character style',
    color: 'bg-blue-100',
    img: 'https://images.unsplash.com/photo-1633511090164-b43840ea1607?w=400&h=600&fit=crop'
  },
]

export function StyleCategories() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-stone-100 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">
              Browse by <span className="text-primary italic">Style</span>
            </h2>
          </div>
          <Link href="/products" className="text-primary hover:text-primary-700 font-medium hidden md:block">
            View all styles →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STYLES.map((style) => (
            <Link 
              key={style.id} 
              href={`/products?query=${style.id}`} 
              className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image 
                src={style.img} 
                alt={style.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-serif mb-2">{style.name}</h3>
                <p className="text-stone-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {style.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
