import { ProductMetadata } from '@/types/product'
import { useTranslations } from 'next-intl'

export function ProductFeatures({ metadata }: { metadata?: ProductMetadata }) {
  const t = useTranslations('Products')
  if (!metadata?.features) return null
  
  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-lg font-semibold mb-4">{t('productParams')}</h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        {Object.entries(metadata.features).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <dt className="text-sm font-medium text-gray-500">{key}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
