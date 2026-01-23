import { RefreshCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReturnData {
  orderId: string;
  eligible: boolean;
  reason: string;
  policy: { windowDays: number };
}

export function ReturnCard({ data }: { data: ReturnData }) {
  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden text-sm ${data.eligible ? 'bg-white border-stone-200' : 'bg-red-50 border-red-100'}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${data.eligible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {data.eligible ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className={`font-semibold ${data.eligible ? 'text-stone-800' : 'text-red-800'}`}>
              {data.eligible ? 'Return Eligible' : 'Not Eligible'}
            </h4>
            <p className="text-stone-500 text-xs mt-1">{data.reason}</p>
          </div>
        </div>

        {data.eligible && (
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full bg-stone-900 text-white hover:bg-stone-800 text-xs h-8"
              onClick={() => {
                // Demo-only placeholder: inform users this is a mock action.
                alert('This is a demo action. In production, this would start the return flow.');
              }}
            >
              <RefreshCcw className="w-3 h-3 mr-2" />
              Start Return Process
            </Button>
            <p className="text-[10px] text-center text-stone-400 mt-2">
              Within {data.policy.windowDays}-day policy window.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
