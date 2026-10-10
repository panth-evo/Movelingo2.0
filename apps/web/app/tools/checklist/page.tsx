"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ChecklistItem } from '@/lib/types';
import { ListChecks, CheckCircle2, Circle } from 'lucide-react';

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    api.getArrivalChecklist().then(setItems).catch(console.error);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Checklist...</p>
      </div>
    );
  }

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const renderGroup = (category: string, title: string) => {
    const groupItems = items.filter(item => item.category === category);
    if (groupItems.length === 0) return null;

    return (
      <div className="mb-12">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest border-b-2 border-slate-100 pb-4">{title}</h2>
        <div className="space-y-4">
          {groupItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                item.completed 
                  ? 'bg-slate-50 border-slate-200 opacity-60' 
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="shrink-0 mt-1">
                {item.completed ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : (
                  <Circle className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div>
                <h3 className={`text-xl font-black mb-2 ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                  {item.title}
                </h3>
                <p className={`font-medium ${item.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ListChecks className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Arrival Checklist</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          The ultimate step-by-step guide to surviving your first month in your new city.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
        {renderGroup('24h', 'First 24 Hours')}
        {renderGroup('week', 'First Week')}
        {renderGroup('month', 'First Month')}
      </div>
    </div>
  );
}
