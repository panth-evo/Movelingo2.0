"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { EligibilityScore } from '@/lib/types';
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EligibilityPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EligibilityScore | null>(null);

  const handleNext = async (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step === 2) {
      setIsSubmitting(true);
      try {
        const res = await api.checkEligibility(newAnswers);
        setResult(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setResult(null);
  };

  if (result) {
    // Circle math
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (result.score_percentage / 100) * circumference;

    return (
      <div className="max-w-2xl mx-auto py-12 px-6 animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 text-center relative overflow-hidden">
          <button onClick={reset} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 font-bold text-sm">
            <ChevronLeft className="w-4 h-4" /> Reset
          </button>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 mt-8">Eligibility Report</h1>
          <p className="text-lg text-slate-500 font-medium mb-10">{result.route_name}</p>

          <div className="relative w-48 h-48 mx-auto mb-10">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
              {/* Progress circle */}
              <circle 
                cx="70" cy="70" r={radius} fill="transparent" 
                stroke={result.eligible ? "#22c55e" : (result.score_percentage > 50 ? "#eab308" : "#ef4444")} 
                strokeWidth="12" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900">{result.score_percentage}%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Match</span>
            </div>
          </div>

          {result.eligible ? (
            <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200 mb-8 flex items-start gap-4 text-left">
              <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
              <div>
                <h3 className="text-xl font-black mb-1">Highly Eligible</h3>
                <p className="font-medium text-green-700">You meet the core requirements for this route. Your next step is to master the required language level.</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-200 mb-8 flex items-start gap-4 text-left">
              <AlertCircle className="w-8 h-8 text-red-600 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black mb-2">Requirements Missing</h3>
                <ul className="space-y-2">
                  {result.missing_requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 font-bold text-red-700">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div> {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <Link href="/dashboard" className="w-full block bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-colors">
            Continue to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-12 space-y-4">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Eligibility Checker</h1>
        <p className="text-xl text-slate-500 font-medium">Verify your points for the EU Blue Card before committing.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 relative overflow-hidden min-h-[300px]">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${(step / 2) * 100}%` }}></div>
        </div>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center h-full pt-16">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
            <div className="text-lg font-bold text-slate-600">Calculating your score...</div>
          </div>
        ) : step === 1 ? (
          <div className="animate-in slide-in-from-right-4 duration-300 pt-8">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Do you hold a recognized university degree?</h2>
            <div className="space-y-4">
              <button onClick={() => handleNext('degree', 'yes')} className="w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 font-bold text-xl text-slate-700 transition-colors flex justify-between items-center group">
                Yes, I have a Bachelor&apos;s or higher
                <ArrowRight className="w-5 h-5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => handleNext('degree', 'no')} className="w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50 font-bold text-xl text-slate-700 transition-colors">
                No, I do not
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-300 pt-8">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Is your gross annual salary offer above €45,300?</h2>
            <div className="space-y-4">
              <button onClick={() => handleNext('salary', 'high')} className="w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 font-bold text-xl text-slate-700 transition-colors flex justify-between items-center group">
                Yes, it is higher
                <ArrowRight className="w-5 h-5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => handleNext('salary', 'low')} className="w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50 font-bold text-xl text-slate-700 transition-colors">
                No, it is lower
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
