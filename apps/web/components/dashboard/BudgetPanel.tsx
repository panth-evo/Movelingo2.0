/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlanResult } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export function BudgetPanel({ plan }: { plan: PlanResult }) {
  const { budget } = plan;
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Budget Estimate</h2>
      
      {budget.savings_gap && budget.savings_gap > 0 && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <span className="font-bold block">Savings Gap Detected</span>
            <span className="text-sm font-medium">You are short approximately {budget.savings_gap} {budget.currency} for the initial move.</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900">One-Time Costs</h3>
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-100">
              {budget.one_time.map((item, i) => (
                <tr key={i} className="bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.label}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {item.amount !== null ? `${item.amount} ${budget.currency}` : <span className="text-slate-400 font-normal italic">Not yet verified</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900">Monthly Costs (Estimate)</h3>
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-100">
              {budget.monthly.map((item, i) => (
                <tr key={i} className="bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.label}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {item.amount !== null ? `${item.amount} ${budget.currency}` : <span className="text-slate-400 font-normal italic">Not yet verified</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
