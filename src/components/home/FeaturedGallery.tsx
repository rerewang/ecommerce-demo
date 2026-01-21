import { getProducts } from "@/services/products"
import { ProductCard } from "@/components/products/ProductCard"

export async function FeaturedGallery() {
  const products = await getProducts({ sort: 'newest' })

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
            Curated <span className="text-primary italic">Gallery</span>
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Explore our latest AI-generated masterpieces. Each portrait is unique.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="hover:-translate-y-2 transition-transform duration-500">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
