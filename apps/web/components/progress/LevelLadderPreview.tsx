"use client";

import { ProgressResponse } from '@/lib/types';
import { motion } from 'framer-motion';

export function LevelLadderPreview({ data }: { data: ProgressResponse }) {
  return (
    <div className="space-y-3">
      {data.levels.map((level) => (
        <div key={level.level} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-slate-800">{level.level}</h3>
            <span className={`px-2 py-1 rounded text-xs font-semibold tracking-wide ${
              level.status === 'certified' ? 'bg-green-100 text-green-700' :
              level.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-500'
            }`}>
              {level.status === 'certified' ? 'CERTIFIED' :
               level.status === 'in_progress' ? 'IN PROGRESS' : 'LOCKED'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${level.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full ${
                level.status === 'certified' ? 'bg-green-500' :
                level.status === 'in_progress' ? 'bg-blue-500' :
                'bg-slate-300'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
