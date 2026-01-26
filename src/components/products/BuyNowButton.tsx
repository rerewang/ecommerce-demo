'use client'

import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/Button'
import { useCheckoutStore } from '@/store/checkout'
import { Product } from '@/types/product'
import { useTranslations } from 'next-intl'

interface Props {
  product: Product
  variants: Record<string, string>
  disabled?: boolean
}

export function BuyNowButton({ product, variants, disabled }: Props) {
  const router = useRouter()
  const setDirectBuyItem = useCheckoutStore((s) => s.setDirectBuyItem)
  const t = useTranslations('Products')

  const handleBuyNow = () => {
    setDirectBuyItem({
      product,
      quantity: 1,
      variants
    })
    router.push('/checkout?source=direct')
  }

  return (
    <Button 
      onClick={handleBuyNow} 
      disabled={disabled}
      className="flex-1 bg-orange-600 hover:bg-orange-700"
    >
      {t('buyNow')}
    </Button>
  )
}
