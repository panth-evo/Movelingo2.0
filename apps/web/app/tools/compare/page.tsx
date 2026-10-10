"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CountryData } from '@/lib/types';
import { Globe2, TrendingUp, TrendingDown, Clock, ShieldCheck, Banknote } from 'lucide-react';

export default function ComparePage() {
  const [data, setData] = useState<CountryData[]>([]);

  useEffect(() => {
    api.getCountryComparison().then(setData).catch(console.error);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Data...</p>
      </div>
    );
  }

  // Pre-calculate "best" values to highlight them
  const lowestRent = Math.min(...data.map(d => d.avg_rent_1bed));
  const highestSalary = Math.max(...data.map(d => d.avg_salary_tech));
  const lowestVisa = Math.min(...data.map(d => d.visa_processing_weeks));
  const lowestCol = Math.min(...data.map(d => d.cost_of_living_index));

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Destination Comparison</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Analyze hard data across the top DACH region destinations to find your perfect fit.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="p-6 font-black text-slate-900 uppercase tracking-wider text-sm sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Destination</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-sm min-w-[180px]">
                  <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> Avg Rent (1 Bed)</div>
                </th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-sm min-w-[180px]">
                  <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Tech Salary Avg</div>
                </th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-sm min-w-[180px]">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Visa Processing</div>
                </th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-sm min-w-[180px]">Language Req</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-sm min-w-[180px]">
                  <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Healthcare</div>
                </th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-sm min-w-[180px]">
                  <div className="flex items-center gap-2"><TrendingDown className="w-4 h-4" /> CoL Index</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-black text-slate-900 text-xl flex items-center gap-3 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <span className="text-3xl">{row.flag}</span>
                    {row.country}
                  </td>
                  
                  <td className="p-6">
                    <div className={`font-bold text-lg inline-flex px-3 py-1 rounded-lg ${row.avg_rent_1bed === lowestRent ? 'bg-green-100 text-green-700' : 'text-slate-700'}`}>
                      €{row.avg_rent_1bed.toLocaleString()}
                    </div>
                  </td>
                  
                  <td className="p-6">
                    <div className={`font-bold text-lg inline-flex px-3 py-1 rounded-lg ${row.avg_salary_tech === highestSalary ? 'bg-green-100 text-green-700' : 'text-slate-700'}`}>
                      €{row.avg_salary_tech.toLocaleString()}
                    </div>
                  </td>
                  
                  <td className="p-6">
                    <div className={`font-bold text-lg inline-flex px-3 py-1 rounded-lg ${row.visa_processing_weeks === lowestVisa ? 'bg-green-100 text-green-700' : 'text-slate-700'}`}>
                      {row.visa_processing_weeks} weeks
                    </div>
                  </td>
                  
                  <td className="p-6">
                    <div className="font-bold text-lg text-slate-700 inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                      {row.language_requirement}
                    </div>
                  </td>
                  
                  <td className="p-6 font-bold text-lg text-slate-700">
                    {row.healthcare_quality}
                  </td>
                  
                  <td className="p-6">
                    <div className={`font-bold text-lg inline-flex px-3 py-1 rounded-lg ${row.cost_of_living_index === lowestCol ? 'bg-green-100 text-green-700' : 'text-slate-700'}`}>
                      {row.cost_of_living_index}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
        <div className="w-3 h-3 bg-green-100 rounded-full"></div> = Most Favorable Metric
      </div>
    </div>
  );
}
