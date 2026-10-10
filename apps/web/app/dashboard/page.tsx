"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PlanResult, ProgressResponse, RelocationInfo } from '@/lib/types';
import { LevelLadder } from '@/components/progress/LevelLadder';
import { OverviewPanel } from '@/components/dashboard/OverviewPanel';
import { MovePlanPanel } from '@/components/dashboard/MovePlanPanel';
import { BudgetPanel } from '@/components/dashboard/BudgetPanel';
import { DocumentsPanel } from '@/components/dashboard/DocumentsPanel';
import { DestinationPanel } from '@/components/dashboard/DestinationPanel';
import { VisaGuidePanel } from '@/components/dashboard/VisaGuidePanel';

export default function DashboardPage() {
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [relocation, setRelocation] = useState<RelocationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lang = (typeof window !== 'undefined' ? localStorage.getItem('target_language') || 'de' : 'de') as Language;
    Promise.all([
      api.getPlan(),
      api.getProgress(lang)
    ]).then(([pl, pr]) => {
      setPlan(pl);
      setProgress(pr);
      // Fetch relocation info based on the plan's country
      return api.getRelocationInfo(pl.target_country);
    }).then(setRelocation).catch(e => {
      console.error(e);
      setError("Could not load dashboard data. You may need to complete Onboarding first.");
    });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="text-red-500 font-bold">{error}</div>
        <a href="/onboarding" className="text-blue-600 underline">Go to Onboarding</a>
      </div>
    );
  }

  if (!plan || !progress || !relocation) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
      </div>
      
      <OverviewPanel plan={plan} progress={progress} />

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Focus) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Language Tracker</h2>
            <LevelLadder data={progress} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <DocumentsPanel plan={plan} />
            <DestinationPanel info={relocation} />
          </div>

          <VisaGuidePanel plan={plan} />
        </div>
        
        {/* Right Column (Secondary / Timelines) */}
        <div className="space-y-8">
          <MovePlanPanel plan={plan} />
          <BudgetPanel plan={plan} />
        </div>
      </div>
    </div>
  );
}
