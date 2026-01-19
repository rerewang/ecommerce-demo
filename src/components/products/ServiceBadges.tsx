import { Truck, ShieldCheck, Clock } from 'lucide-react'

export function ServiceBadges() {
  return (
    <div className="flex gap-4 my-6 text-sm text-slate-600">
      <div className="flex items-center gap-1">
        <Truck className="w-4 h-4" />
        <span>包邮</span>
      </div>
      <div className="flex items-center gap-1">
        <ShieldCheck className="w-4 h-4" />
        <span>7天退换</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>24h发货</span>
      </div>
    </div>
  )
}
