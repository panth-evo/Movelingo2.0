"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SimulatorScenario } from '@/lib/types';
import { MessageSquare, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function SimulatorLobbyPage() {
  const [scenarios, setScenarios] = useState<SimulatorScenario[]>([]);

  useEffect(() => {
    api.getSimulators().then(setScenarios).catch(console.error);
  }, []);

  if (scenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Scenarios...</p>
      </div>
    );
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Real-Life Simulator</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Practice high-stakes bureaucratic conversations in a safe, stress-free environment before doing it for real.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {scenarios.map(scenario => (
          <Link 
            href={`/tools/simulator/${scenario.id}`} 
            key={scenario.id}
            className="block group bg-white border-2 border-slate-200 rounded-3xl p-8 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getDifficultyColor(scenario.difficulty)}`}>
                {scenario.difficulty}
              </div>
              <Activity className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              {scenario.title}
            </h3>
            
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              {scenario.description}
            </p>
            
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-sm">
              Start Simulation <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
