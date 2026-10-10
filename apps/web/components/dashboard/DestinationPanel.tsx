/* eslint-disable @typescript-eslint/no-unused-vars */
import { RelocationInfo } from '@/lib/types';
import { MapPin } from 'lucide-react';

export function DestinationPanel({ info }: { info: RelocationInfo }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Destination: {info.country}</h2>
      
      <div className="space-y-4">
        {info.cities.map((city, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-start mb-2 gap-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400"/> {city.name}</h3>
              <span className="text-xs font-bold tracking-widest uppercase bg-white px-2 py-1 rounded-md text-slate-600 border border-slate-200 shrink-0">
                {city.rent_range_eur ? `€${city.rent_range_eur}` : 'Unknown rent'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">{city.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
