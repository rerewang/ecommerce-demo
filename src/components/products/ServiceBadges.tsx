import { Truck, ShieldCheck, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ServiceBadges() {
  const t = useTranslations('Products.services')
  return (
    <div className="flex gap-4 my-6 text-sm text-slate-600">
      <div className="flex items-center gap-1">
        <Truck className="w-4 h-4" />
        <span>{t('freeShipping')}</span>
      </div>
      <div className="flex items-center gap-1">
        <ShieldCheck className="w-4 h-4" />
        <span>{t('returns')}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>{t('fastDelivery')}</span>
      </div>
    </div>
  )
}
