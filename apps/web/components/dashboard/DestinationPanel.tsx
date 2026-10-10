"use client";

import { RelocationInfo } from '@/lib/types';
import { MapPin, Sparkles, Search, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function DestinationPanel({ info }: { info: RelocationInfo }) {
  const [mode, setMode] = useState<'select' | 'confirmed'>('select');
  const [inputCity, setInputCity] = useState('');
  const [selectedCity, setSelectedCity] = useState<{name: string, rent_range_eur?: string, note: string} | null>(null);

  const handleConfirm = () => {
    if (!inputCity.trim()) return;
    
    // Try to find a match in info.cities
    const match = info.cities.find(c => c.name.toLowerCase().includes(inputCity.toLowerCase().trim()));
    
    if (match) {
      setSelectedCity(match);
    } else {
      setSelectedCity({
        name: inputCity,
        rent_range_eur: '800 - 1500 (Est.)',
        note: `Custom city selected in ${info.country}. Costs may vary based on lifestyle and neighborhood.`
      });
    }
    setMode('confirmed');
  };

  const handleAISuggest = () => {
    // Pick a random city from the list
    if (info.cities.length > 0) {
      const randomCity = info.cities[Math.floor(Math.random() * info.cities.length)];
      setSelectedCity(randomCity);
      setMode('confirmed');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Destination: {info.country}</h2>
      
      {mode === 'select' ? (
        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-2">Which city are you moving to?</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={inputCity}
                    onChange={(e) => setInputCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    placeholder="e.g. Berlin"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>
                <button 
                  onClick={handleConfirm}
                  disabled={!inputCity.trim()}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <button 
              onClick={handleAISuggest}
              className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Not sure? Let AI suggest a city
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          {selectedCity && (
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="flex justify-between items-start mb-3 gap-4">
                <h3 className="font-extrabold text-xl text-blue-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500"/> 
                  {selectedCity.name}
                </h3>
                <span className="text-xs font-bold tracking-widest uppercase bg-white px-2 py-1 rounded-md text-blue-800 border border-blue-200 shrink-0">
                  {selectedCity.rent_range_eur ? `€${selectedCity.rent_range_eur} / mo` : 'Unknown rent'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedCity.note}</p>
              
              <button 
                onClick={() => {
                  setMode('select');
                  setInputCity('');
                }}
                className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Search className="w-3 h-3" /> Change City
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
