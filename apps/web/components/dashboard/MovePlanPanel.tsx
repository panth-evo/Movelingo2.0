/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlanResult } from '@/lib/types';
import { AlertTriangle, Info } from 'lucide-react';

export function MovePlanPanel({ plan }: { plan: PlanResult }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Move Plan</h2>
          <p className="text-slate-500 font-medium mt-1">{plan.recommended_route} ({plan.target_country})</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase shrink-0 ${plan.on_track ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {plan.on_track ? 'ON TRACK' : 'BEHIND'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div>
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Required Level</span>
          <span className="font-extrabold text-xl text-slate-900">{plan.required_level}</span>
        </div>
        <div>
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Weeks left</span>
          <span className="font-extrabold text-xl text-slate-900 tabular-nums">{plan.weeks_to_target}</span>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-4">Milestones</h3>
        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
          {plan.milestones.map((m, i) => (
            <div key={m.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-4 border-white" />
              <div className="font-bold text-slate-800">{m.label}</div>
              <div className="text-sm font-medium text-slate-500">{m.due_date}</div>
            </div>
          ))}
        </div>
      </div>

      {plan.risks.length > 0 && (
        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
          <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4"/> Risks</h3>
          <ul className="list-disc list-outside ml-4 text-sm font-medium text-orange-700 space-y-2">
            {plan.risks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h3 className="font-bold text-slate-900">Sources</h3>
        <ul className="text-sm space-y-3">
          {plan.sources.map((s, i) => (
            <li key={i} className="flex flex-col">
              <a href={s.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">{s.label}</a>
              <span className="text-slate-400 font-medium text-xs">Verified: {s.last_verified}</span>
            </li>
          ))}
        </ul>
        <div className="bg-slate-50 p-4 rounded-xl mt-4 border border-slate-100 flex items-start gap-3">
          <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            {plan.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
