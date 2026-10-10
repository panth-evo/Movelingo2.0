"use client";

import { PlanResult } from '@/lib/types';
import { Circle, CheckCircle2, Sparkles, FileText, Info } from 'lucide-react';
import { useState } from 'react';

export function DocumentsPanel({ plan }: { plan: PlanResult }) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [generatedDetails, setGeneratedDetails] = useState<string | null>(null);

  const getDocDetails = (label: string) => {
    if (label.toLowerCase().includes('passport')) {
      return (
        <ul className="space-y-2 mt-3 text-sm text-slate-600">
          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Ensure it has at least 2 blank pages.</li>
          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Must be valid for a minimum of 6 months beyond your intended arrival date.</li>
          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />If applying for a new passport, do this before any other step (can take 4-8 weeks).</li>
        </ul>
      );
    }
    if (label.toLowerCase().includes('degree')) {
      return (
        <ul className="space-y-2 mt-3 text-sm text-slate-600">
          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Verify your degree on the official Anabin database (for Germany).</li>
          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Get an Apostille from your home country's Ministry of Foreign Affairs.</li>
          <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Must be translated into the target language by a sworn, court-certified translator.</li>
        </ul>
      );
    }
    return (
      <ul className="space-y-2 mt-3 text-sm text-slate-600">
        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Prepare the original document and make at least 2 certified copies.</li>
        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Check with the local consulate if standard translation is sufficient or if an Apostille is required.</li>
      </ul>
    );
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Documents</h2>
      </div>
      
      <p className="text-slate-500 text-sm">Select a document to see exactly how to prepare it for your visa application.</p>

      <div className="space-y-3">
        {plan.document_checklist.map((doc) => {
          const isSelected = selectedDoc === doc.id;
          const isGenerated = generatedDetails === doc.id;

          return (
            <div 
              key={doc.id} 
              onClick={() => {
                if (selectedDoc !== doc.id) {
                  setSelectedDoc(doc.id);
                  setGeneratedDetails(null);
                }
              }}
              className={`flex flex-col p-4 border rounded-xl transition-all cursor-pointer group
                ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:bg-slate-50 hover:border-blue-200'}
              `}
            >
              <div className="flex items-start gap-4">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                )}
                <div className="space-y-2 w-full">
                  <span className={`font-bold block ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{doc.label}</span>
                  <div className="flex gap-2 flex-wrap">
                    {doc.needs_translation && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800">Needs Translation</span>}
                    {doc.needs_apostille && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-800">Needs Apostille</span>}
                    {!doc.needs_translation && !doc.needs_apostille && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">Standard</span>}
                  </div>
                </div>
              </div>

              {/* Expanded Action Area */}
              {isSelected && !isGenerated && (
                <div className="mt-4 ml-9 flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Info className="w-4 h-4 text-blue-500" />
                    Action required
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setGeneratedDetails(doc.id);
                    }}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Steps
                  </button>
                </div>
              )}

              {/* Generated Details Area */}
              {isSelected && isGenerated && (
                <div className="mt-4 ml-9 bg-white p-4 rounded-xl border border-blue-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">How to prepare this document:</h4>
                  {getDocDetails(doc.label)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
