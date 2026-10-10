import { PlanResult } from '@/lib/types';
import { Circle } from 'lucide-react';

export function DocumentsPanel({ plan }: { plan: PlanResult }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Documents</h2>
      <div className="space-y-3">
        {plan.document_checklist.map((doc) => (
          <div key={doc.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block">{doc.label}</span>
              <div className="flex gap-2">
                {doc.needs_translation && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800">Needs Translation</span>}
                {doc.needs_apostille && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-800">Needs Apostille</span>}
                {!doc.needs_translation && !doc.needs_apostille && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">Standard</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
