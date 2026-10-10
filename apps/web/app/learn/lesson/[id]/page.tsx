"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LessonData } from '@/lib/types';
import { BookOpen, Sparkles, Languages, PenTool, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<LessonData | null>(null);

  useEffect(() => {
    api.getLesson(params.id).then(setLesson).catch(console.error);
  }, [params.id]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-black tracking-widest uppercase text-sm">Generating AI Lesson...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12 animate-in fade-in zoom-in-95 duration-500 pb-24">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-10 sm:p-14 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border border-blue-500/30">
            <BookOpen className="w-4 h-4" /> Micro-Lesson • {lesson.cefr_level}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">{lesson.topic}</h1>
          <p className="text-xl text-slate-300 font-medium leading-relaxed">{lesson.summary}</p>
        </div>
      </div>

      {/* Context Area */}
      {lesson.original_text && (
        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-200 shadow-sm relative">
          <div className="absolute -top-4 left-8 bg-amber-200 text-amber-800 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            Source Text
          </div>
          <p className="text-lg text-amber-900 font-medium italic mt-2">&quot;{lesson.original_text}&quot;</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Vocabulary */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Languages className="w-7 h-7 text-blue-600" /> Key Vocabulary
          </h2>
          <div className="space-y-4">
            {lesson.vocabulary.map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-black text-blue-900 group-hover:text-blue-600 transition-colors">{v.word}</h3>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold uppercase">{v.translation}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600 font-medium text-sm">
                  <span className="font-bold text-slate-400 mr-2">Context:</span>
                  {v.context}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <PenTool className="w-7 h-7 text-purple-600" /> Grammar Rules
          </h2>
          <div className="space-y-4">
            {lesson.grammar.map((g, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-black text-purple-900 mb-2">{g.rule}</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-4">{g.explanation}</p>
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Examples</div>
                  <ul className="space-y-2">
                    {g.examples.map((ex, j) => (
                      <li key={j} className="flex gap-2 items-start text-sm font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <Link href={`/learn/practice?lesson=${lesson.lesson_id}`} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl">
          Practice this topic <Sparkles className="w-5 h-5" />
        </Link>
      </div>

    </div>
  );
}
