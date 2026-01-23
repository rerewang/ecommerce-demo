import { Bell, Check } from 'lucide-react';

interface AlertData {
  id: string;
  type: 'price_drop' | 'restock';
  targetPrice?: number;
  message: string;
}

export function AlertCard({ data }: { data: AlertData }) {
  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden text-sm bg-gradient-to-br from-blue-50 to-white">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-3 h-3 text-green-500" />
            <span className="font-semibold text-stone-800 text-xs uppercase tracking-wider">
              {data.message}
            </span>
          </div>
          <p className="text-stone-600 font-medium">
            {data.type === 'price_drop' ? 'Price Drop' : 'Restock'} Alert Set
          </p>
          {data.targetPrice && (
            <p className="text-xs text-stone-400 mt-0.5">
              Target: ${data.targetPrice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
