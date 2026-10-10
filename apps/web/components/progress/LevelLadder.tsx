"use client";

import { useState } from 'react';
import { ProgressResponse, Level } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import Link from 'next/link';

interface Props {
  data: ProgressResponse;
}

const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

function SkillBar({ name, data, isLight = false }: { name: string; data: { progress: number; certified: boolean }; isLight?: boolean }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center text-sm mb-1.5 font-medium">
        <span className="capitalize text-slate-700">{name}</span>
        <div className="flex items-center gap-1.5">
          {data.certified && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          <span className="text-slate-900 tabular-nums">{Math.round(data.progress)}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={data.progress} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${isLight ? 'bg-indigo-400' : 'bg-indigo-600'}`}
        />
      </div>
      {!data.certified && data.progress >= 75 && (
        <p className="text-xs text-orange-600 mt-1.5 font-bold">Pass the exam section to finish</p>
      )}
    </div>
  );
}

export function LevelLadder({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(data.current_level);

  const currIdx = LEVEL_ORDER.indexOf(data.current_level);
  const targetIdx = LEVEL_ORDER.indexOf(data.target_level);
  const gap = Math.max(0, targetIdx - currIdx);

  return (
    <div className="space-y-4">
      {gap > 0 && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-5 py-4 rounded-2xl flex items-center justify-between font-bold shadow-sm">
          <span>Gap to target: {gap} level{gap > 1 ? 's' : ''}</span>
          <Flag className="w-6 h-6 text-orange-500" />
        </div>
      )}

      <div className="space-y-4">
        {data.levels.map((levelObj) => {
          const isTarget = levelObj.level === data.target_level;
          const isCurrent = levelObj.level === data.current_level;
          const isExpanded = expanded === levelObj.level;

          return (
            <div key={levelObj.level} className={`border rounded-3xl overflow-hidden transition-all duration-300 ${isCurrent ? 'border-blue-400 shadow-md ring-2 ring-blue-100' : 'border-slate-200 bg-white'}`}>
              
              <div 
                className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                onClick={() => setExpanded(isExpanded ? null : levelObj.level)}
              >
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-2xl font-extrabold text-slate-900">{levelObj.level}</h3>
                    
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
                      levelObj.status === 'certified' ? 'bg-green-100 text-green-700' :
                      levelObj.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {levelObj.status.replace('_', ' ')}
                    </span>
                    
                    {isTarget && (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-purple-100 text-purple-700">
                        Required for route
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={levelObj.progress} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelObj.progress}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className={`h-full ${
                        levelObj.status === 'certified' ? 'bg-green-500' :
                        levelObj.status === 'in_progress' ? 'bg-blue-600' :
                        'bg-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 mt-2 sm:mt-0">
                  <span className="font-extrabold text-slate-800 text-2xl tabular-nums">{Math.round(levelObj.progress)}%</span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50 border-t border-slate-100"
                  >
                    <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-x-12 gap-y-6">
                      {levelObj.status === 'locked' ? (
                        <div className="col-span-full py-12 flex flex-col items-center text-slate-400 justify-center">
                          <Lock className="w-10 h-10 mb-3 opacity-30" />
                          <p className="font-semibold text-lg text-slate-500">This level is currently locked.</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Core Skills</h4>
                            <SkillBar name="reading" data={levelObj.skills.reading} />
                            <SkillBar name="listening" data={levelObj.skills.listening} />
                            <SkillBar name="writing" data={levelObj.skills.writing} />
                            <SkillBar name="speaking" data={levelObj.skills.speaking} />
                          </div>
                          <div className="space-y-5 flex flex-col h-full">
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Foundations</h4>
                              <SkillBar name="vocabulary" data={levelObj.skills.vocabulary} isLight />
                              <SkillBar name="grammar" data={levelObj.skills.grammar} isLight />
                            </div>
                            
                            {isCurrent && (
                              <div className="mt-auto pt-6 border-t border-slate-200">
                                <Link href="/exams" className="flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                                  Take an exam
                                </Link>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })}
      </div>
    </div>
  );
}
