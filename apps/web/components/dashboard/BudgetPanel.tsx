"use client";

import { PlanResult } from '@/lib/types';
import { AlertCircle, CheckCircle2, GraduationCap, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function BudgetPanel({ plan }: { plan: PlanResult }) {
  const { budget } = plan;
  const [userBudget, setUserBudget] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const MINIMUM_BUDGET = 11208; // German blocked account requirement

  const getUniversities = (budgetAmt: number) => {
    if (budgetAmt < MINIMUM_BUDGET) return null;
    
    if (budgetAmt < 15000) {
      return [
        { name: 'RWTH Aachen University', type: 'Public • Low Fees', link: 'https://www.rwth-aachen.de' },
        { name: 'University of Cologne', type: 'Public • Low Fees', link: 'https://www.uni-koeln.de' },
        { name: 'LMU Munich', type: 'Public • Low Fees', link: 'https://www.lmu.de' },
      ];
    }
    return [
      { name: 'Constructor University (Bremen)', type: 'Private • High Tuition', link: 'https://constructor.university' },
      { name: 'Frankfurt School of Finance & Management', type: 'Private • High Tuition', link: 'https://www.frankfurt-school.de' },
      { name: 'GISMA Business School', type: 'Private • Moderate Tuition', link: 'https://www.gisma.com' },
    ];
  };

  const parsedBudget = parseFloat(userBudget);
  const isValid = !isNaN(parsedBudget) && parsedBudget >= MINIMUM_BUDGET;
  const unis = (isValid && showSuggestions) ? getUniversities(parsedBudget) : null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-900">Budget Estimate & Universities</h2>
      
      {/* Interactive Budget Input */}
      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <label className="block font-bold text-slate-700">What is your total available budget? (EUR)</label>
        <div className="flex gap-4 items-center">
          <input 
            type="number" 
            value={userBudget}
            onChange={(e) => {
              setUserBudget(e.target.value);
              setShowSuggestions(false);
            }}
            placeholder="e.g. 12000"
            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
          />
        </div>
        
        {userBudget && !isValid && (
          <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2 text-red-800 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">
              You must lock a minimum of <strong>€{MINIMUM_BUDGET}</strong> for the mandatory German Blocked Account (Sperrkonto) to get a student visa.
            </p>
          </div>
        )}
        {isValid && !showSuggestions && (
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between text-emerald-800 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="font-bold">Budget meets the minimum visa requirement!</p>
            </div>
            <button 
              onClick={() => setShowSuggestions(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate Suggestions
            </button>
          </div>
        )}
      </div>

      {/* University Recommendations */}
      {unis && (
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            Recommended Universities for your budget
          </h3>
          <div className="space-y-3">
            {unis.map((uni, idx) => (
              <div key={idx} className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800">{uni.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    {uni.type}
                  </span>
                </div>
                <Link href={uni.link} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
                  <LinkIcon className="w-4 h-4" />
                  Official Website
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Cost Breakdowns */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="font-bold text-slate-900">One-Time Costs (Standard)</h3>
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-100">
              {budget.one_time.map((item, i) => (
                <tr key={i} className="bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.label}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {item.amount !== null ? `${item.amount} ${budget.currency}` : <span className="text-slate-400 font-normal italic">Not yet verified</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900">Monthly Costs (Estimate)</h3>
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-100">
              {budget.monthly.map((item, i) => (
                <tr key={i} className="bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.label}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {item.amount !== null ? `${item.amount} ${budget.currency}` : <span className="text-slate-400 font-normal italic">Not yet verified</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
