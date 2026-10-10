/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SpecSummary, Language } from '@/lib/types';
import { FileText, Clock, PlayCircle } from 'lucide-react';

export default function ExamsPickerPage() {
  const router = useRouter();
  const [specs, setSpecs] = useState<SpecSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [generatingSpec, setGeneratingSpec] = useState<string | null>(null);
  const [paperId, setPaperId] = useState<string | null>(null);
  const [pollStats, setPollStats] = useState({ ready: 0, total: 0 });

  const language = (typeof window !== 'undefined' ? localStorage.getItem('target_language') || 'de' : 'de') as Language;

  useEffect(() => {
    api.getSpecs(language).then(res => {
      setSpecs(res);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setError("Could not load exams.");
      setLoading(false);
    });
  }, [language]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (paperId) {
      interval = setInterval(async () => {
        try {
          const p = await api.getPaper(paperId);
          setPollStats({ ready: p.parts_ready, total: p.parts_total });
          if (p.status === 'ready') {
            clearInterval(interval);
            router.push(`/exams/${paperId}`);
          }
        } catch (e) {}
      }, 1500);
    }
    
    return () => clearInterval(interval);
  }, [paperId, router]);

  const handleGenerate = async (spec_id: string, scope: 'full' | 'section' | 'part') => {
    setGeneratingSpec(spec_id);
    try {
      const res = await api.generateExam({ language, spec_id, scope });
      setPaperId(res.paper_id);
    } catch (e) {
      console.error(e);
      setGeneratingSpec(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading exams...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Exam Practice</h1>
        <p className="text-lg text-slate-600 mt-2">Select a format to practice your language skills.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {specs.map(spec => (
          <div key={spec.spec_id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black text-slate-900">{spec.exam_name}</h2>
                  <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg uppercase tracking-widest">{spec.cefr}</span>
                </div>
                {spec.derived && (
                  <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-md uppercase tracking-wider border border-purple-100">
                    Practice format, not official timing
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {spec.sections.map((sec, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700 capitalize flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400"/> {sec.skill}</span>
                  <span className="text-slate-500 font-medium">{sec.parts} parts • {sec.duration_min} min</span>
                </div>
              ))}
            </div>

            {generatingSpec === spec.spec_id ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="text-blue-900 font-bold">Building your paper...</div>
                {paperId && <div className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">{pollStats.ready} / {pollStats.total} parts ready</div>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleGenerate(spec.spec_id, 'full')}
                  className="sm:col-span-3 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                >
                  <Clock className="w-5 h-5" /> Full Mock Exam
                </button>
                <button 
                  onClick={() => handleGenerate(spec.spec_id, 'section')}
                  className="sm:col-span-1.5 flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors border border-blue-100"
                >
                   One Section
                </button>
                <button 
                  onClick={() => handleGenerate(spec.spec_id, 'part')}
                  className="sm:col-span-1.5 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors border border-slate-200"
                >
                   One Part Drill
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
