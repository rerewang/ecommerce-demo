import { MapPin, Package } from 'lucide-react';

interface TimelineEvent {
  label: string;
  status: string;
  date: string;
}

interface OrderData {
  orderId: string;
  status: string;
  total: number;
  shippingAddress: { city: string };
  timeline: TimelineEvent[];
}

export function OrderCard({ data }: { data: OrderData }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-sm">
      {/* Header */}
      <div className="bg-stone-50 p-3 border-b border-stone-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-stone-500" />
          <span className="font-semibold text-stone-700">Order #{data.orderId.slice(0, 8)}</span>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">
          {data.status}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between text-stone-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{data.shippingAddress.city}</span>
          </div>
          <div className="font-medium">${data.total}</div>
        </div>

        {/* Timeline */}
        <div className="space-y-3 relative pl-2 border-l border-stone-200 ml-1">
          {data.timeline.map((event, i) => (
            <div key={i} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                event.status === 'completed' || event.status === 'current' 
                  ? 'bg-blue-500 border-white ring-1 ring-blue-100' 
                  : 'bg-stone-200 border-white'
              }`} />
              <div className="flex flex-col">
                <span className={`text-xs font-medium ${event.status === 'current' ? 'text-blue-600' : 'text-stone-700'}`}>
                  {event.label}
                </span>
                <span className="text-[10px] text-stone-400">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
