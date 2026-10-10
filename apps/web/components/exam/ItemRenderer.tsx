"use client";

import { ExamPaper } from '@/lib/types';

type ExamItem = ExamPaper['sections'][0]['parts'][0]['items'][0];

interface ItemRendererProps {
  item: ExamItem;
  value: string;
  onChange: (val: string) => void;
}

export function ItemRenderer({ item, value, onChange }: ItemRendererProps) {
  if (item.type === 'mcq') {
    return (
      <div className="space-y-3">
        <p className="font-medium text-slate-900 text-lg leading-snug">{item.prompt}</p>
        <div className="space-y-2">
          {item.options?.map((opt) => (
            <label key={opt.key} className={`block border p-4 rounded-xl cursor-pointer transition-all ${value === opt.key ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${value === opt.key ? 'border-blue-600' : 'border-slate-300'}`}>
                  {value === opt.key && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-500 uppercase">{opt.key}.</span>
                  <span className="text-slate-800">{opt.text}</span>
                </div>
                <input type="radio" name={item.item_id} value={opt.key} checked={value === opt.key} onChange={() => onChange(opt.key)} className="hidden" />
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (item.type === 'true_false' || item.type === 'yes_no') {
    return (
      <div className="space-y-4 flex flex-col md:flex-row md:items-center md:justify-between bg-slate-50 p-5 rounded-xl border border-slate-200">
        <p className="font-medium text-slate-900 flex-1">{item.prompt}</p>
        <div className="flex gap-2 shrink-0 w-full md:w-auto">
          {item.options?.map((opt) => (
            <label key={opt.key} className={`flex-1 md:flex-none text-center border px-6 py-2.5 rounded-lg cursor-pointer transition-all ${value === opt.key ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'}`}>
              <input type="radio" name={item.item_id} value={opt.key} checked={value === opt.key} onChange={() => onChange(opt.key)} className="hidden" />
              <span className="font-semibold">{opt.text || (opt.key === 'true' ? 'True' : 'False')}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (item.type === 'matching') {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 gap-4">
        <p className="font-medium text-slate-900 flex-1">{item.prompt}</p>
        <div className="shrink-0 flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-600">Match:</span>
          <select 
            className="border-slate-300 rounded-md py-1.5 pl-3 pr-8 text-base font-bold text-blue-700 focus:ring-blue-500 focus:border-blue-500 border bg-white"
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="" disabled>-</option>
            {item.options?.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.key.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // Fallback for short_answer
  return (
    <div className="space-y-2">
      <p className="font-medium text-slate-900">{item.prompt}</p>
      <input type="text" className="w-full border-slate-300 rounded-lg p-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Type your answer..." />
    </div>
  );
}
