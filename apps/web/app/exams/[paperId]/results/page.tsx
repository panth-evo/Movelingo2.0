"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SectionResult, Language } from '@/lib/types';
import { LevelLadder } from '@/components/progress/LevelLadder';
import { Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ExamResultsPage({ params }: { params: { paperId: string } }) {
  const [result, setResult] = useState<SectionResult | null>(null);

  useEffect(() => {
    // Assuming language is stored, default to 'de' if not found
    const lang = (typeof window !== 'undefined' ? localStorage.getItem('target_language') || 'de' : 'de') as Language;
    api.getResults(lang).then(results => {
      const found = results.find(r => r.paper_id === params.paperId) || results[0]; // fallback to first mock in fixtures
      setResult(found);
    }).catch(console.error);
  }, [params.paperId]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-black tracking-widest uppercase text-sm">Analyzing Results...</div>
      </div>
    );
  }

  const isPass = result.passed;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-in fade-in zoom-in-95 duration-500 pb-24">
      {/* Header section */}
      <div className="flex flex-col md:flex-row gap-10 items-center justify-between bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-3 text-center md:text-left flex-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Section Results</h1>
          <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">
            {result.skill} • Level {result.level}
          </p>
          {result.ai_estimated && (
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest mt-4 shadow-sm">
              <Sparkles className="w-4 h-4" /> AI Estimated Grade
            </div>
          )}
        </div>

        <div className="shrink-0 relative group">
          <div className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-opacity group-hover:opacity-60 ${isPass ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <div className={`flex flex-col items-center justify-center w-56 h-56 rounded-full border-[10px] shadow-xl relative z-10 bg-white transition-transform hover:scale-105 ${isPass ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`text-7xl font-black tabular-nums tracking-tighter ${isPass ? 'text-green-600' : 'text-red-600'}`}>
              {result.scaled_100}
            </div>
            <div className={`text-sm font-bold uppercase tracking-widest mt-1 opacity-70 ${isPass ? 'text-green-700' : 'text-red-700'}`}>
              / 100
            </div>
            <div className={`absolute -bottom-5 px-6 py-2 rounded-full text-white font-black uppercase tracking-widest text-sm shadow-lg ${isPass ? 'bg-green-500' : 'bg-red-500'}`}>
              {isPass ? 'Passed' : 'Failed'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-10">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black mb-4 uppercase tracking-widest text-slate-400 text-sm">Examiner Summary</h3>
            <p className="text-slate-800 font-medium leading-relaxed text-lg">{result.summary}</p>
          </div>

          {result.per_part && result.per_part.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-slate-400 text-sm">Score Breakdown</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400">
                    <th className="pb-4">Part</th>
                    <th className="pb-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.per_part.map((p, i) => (
                    <tr key={p.part_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 font-bold text-slate-700 text-lg">Part {i + 1}</td>
                      <td className="py-5 font-black text-slate-900 text-right tabular-nums text-lg">{p.raw} / {p.max}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="py-5 px-4 font-black text-slate-900 uppercase tracking-widest text-sm rounded-bl-xl">Total Raw</td>
                    <td className="py-5 px-4 font-black text-blue-600 text-right tabular-nums text-xl rounded-br-xl">{result.raw} / {result.max}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {result.criteria && result.criteria.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-slate-400 text-sm">Grading Criteria</h3>
              <div className="space-y-8">
                {result.criteria.map((c, i) => (
                  <div key={i} className="border-l-4 border-blue-400 pl-5 space-y-3 py-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-black text-slate-900 capitalize text-lg">{c.criterion.replace(/_/g, ' ')}</h4>
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-xl text-sm font-black tabular-nums shrink-0 border border-blue-100 shadow-sm">
                        {c.points} / {c.max}
                      </div>
                    </div>
                    <div className="inline-block bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                      Band: {c.band}
                    </div>
                    <p className="text-base font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{c.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-10 lg:sticky lg:top-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-sm">Language Progress Updated</h2>
            <LevelLadder data={result.progress} />
          </div>

          <Link href="/dashboard" className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all">
            Return to Dashboard <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
