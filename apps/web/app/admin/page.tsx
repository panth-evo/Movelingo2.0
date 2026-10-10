"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AdminStats } from '@/lib/types';
import { Users, Activity, BrainCircuit, Target, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Admin Panel...</p>
      </div>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-slate-100">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500 font-medium text-sm">Movelingo Global Analytics & AI Oversight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:border-red-200 transition-colors group">
          <div className="flex items-center gap-3 mb-4 text-slate-500 font-bold text-sm uppercase tracking-widest">
            <Users className="w-5 h-5 group-hover:text-red-500 transition-colors" /> Total Users
          </div>
          <div className="text-4xl font-black text-slate-900">{formatNumber(stats.total_users)}</div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:border-red-200 transition-colors group">
          <div className="flex items-center gap-3 mb-4 text-slate-500 font-bold text-sm uppercase tracking-widest">
            <Activity className="w-5 h-5 group-hover:text-red-500 transition-colors" /> Active (30d)
          </div>
          <div className="text-4xl font-black text-slate-900">{formatNumber(stats.active_learners)}</div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:border-red-200 transition-colors group">
          <div className="flex items-center gap-3 mb-4 text-slate-500 font-bold text-sm uppercase tracking-widest">
            <BrainCircuit className="w-5 h-5 group-hover:text-red-500 transition-colors" /> LLM Tokens
          </div>
          <div className="text-4xl font-black text-slate-900">{(stats.llm_tokens_used / 1000000).toFixed(1)}M</div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:border-red-200 transition-colors group">
          <div className="flex items-center gap-3 mb-4 text-slate-500 font-bold text-sm uppercase tracking-widest">
            <Target className="w-5 h-5 group-hover:text-red-500 transition-colors" /> AI Accuracy
          </div>
          <div className="text-4xl font-black text-green-600">{stats.grading_accuracy}%</div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b-2 border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" /> Flagged Exams (Requires Human Review)
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Exams where the grading AI confidence was below 85%.</p>
          </div>
          <div className="bg-red-50 text-red-600 font-black px-4 py-2 rounded-xl">
            {stats.flagged_exams.length} Pending
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-xs">Exam ID</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-xs">Candidate</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-xs">Paper</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-xs">AI Confidence</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-xs">Flag Issue</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-wider text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.flagged_exams.map(exam => (
                <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-bold text-slate-600 text-sm">#{exam.id}</td>
                  <td className="p-6 font-black text-slate-900">{exam.user_name}</td>
                  <td className="p-6 font-bold text-slate-600">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs uppercase tracking-widest">{exam.paper}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${exam.confidence < 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${exam.confidence}%` }}></div>
                      </div>
                      <span className={`font-black text-sm ${exam.confidence < 50 ? 'text-red-600' : 'text-amber-600'}`}>{exam.confidence}%</span>
                    </div>
                  </td>
                  <td className="p-6 font-medium text-slate-600 text-sm">
                    {exam.issue}
                  </td>
                  <td className="p-6 text-right">
                    <button className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm">
                      <Eye className="w-4 h-4" /> Review
                    </button>
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
