"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, BookOpen, PlaneTakeoff } from 'lucide-react';
import { api } from '@/lib/api';
import { ProgressResponse } from '@/lib/types';
import { LevelLadderPreview } from '@/components/progress/LevelLadderPreview';

export default function LandingPage() {
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null);

  useEffect(() => {
    api.getProgress('de').then(setProgressData).catch(console.error);
  }, []);

  return (
    <div className="space-y-24 pb-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto leading-tight">
          Plan your move, learn the language you <span className="text-blue-600">actually need</span>.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MoveLingo connects your relocation timeline to a personalized language learning engine. Stop playing games and start preparing for reality.
        </p>
        <div className="pt-6">
          <Link href="/onboarding" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5">
            Start your plan <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">How it works</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto"><Globe size={28} /></div>
            <h3 className="text-xl font-semibold text-slate-900">1. Pick your route</h3>
            <p className="text-slate-600 leading-relaxed">Tell us where you want to go. We check the exact visa requirements and the CEFR language level you need to succeed.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto"><BookOpen size={28} /></div>
            <h3 className="text-xl font-semibold text-slate-900">2. Learn with purpose</h3>
            <p className="text-slate-600 leading-relaxed">Our AI engine builds a curriculum tailored entirely to your timeline and the specific topics you need to survive abroad.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto"><PlaneTakeoff size={28} /></div>
            <h3 className="text-xl font-semibold text-slate-900">3. Move with confidence</h3>
            <p className="text-slate-600 leading-relaxed">Manage your documents, track your budget accurately, and ace your official language exams all in one unified place.</p>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Countries */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Four countries.</h2>
            <h2 className="text-3xl font-bold text-slate-400">Four official exams.</h2>
          </div>
          <p className="text-lg text-slate-600">We train you exclusively using the formats of the tests recognized by immigration authorities.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { code: 'DE', name: 'Germany', exam: 'Goethe-Zertifikat' },
              { code: 'ES', name: 'Spain', exam: 'DELE' },
              { code: 'FR', name: 'France', exam: 'DELF' },
              { code: 'IT', name: 'Italy', exam: 'CILS' },
            ].map((c) => (
              <div key={c.code} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group">
                <div className="text-2xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">{c.code} <span className="font-medium text-slate-400 text-lg">{c.name}</span></div>
                <div className="text-sm text-slate-500 font-medium">Target Exam: <span className="text-slate-700">{c.exam}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Preview */}
        <section className="bg-slate-100 p-8 rounded-3xl border border-slate-200">
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Track real progress</h2>
          <p className="text-slate-500 mb-6 text-sm">Levels fill based on mock exam scores, not arbitrary points.</p>
          {progressData ? (
            <LevelLadderPreview data={progressData} />
          ) : (
            <div className="animate-pulse flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-[76px] bg-slate-200/60 rounded-lg"></div>)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
