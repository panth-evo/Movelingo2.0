"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SkillNode } from '@/lib/types';
import { Map, CheckCircle2, BookOpen, AlertTriangle, Lock } from 'lucide-react';

export default function SkillMapPage() {
  const [nodes, setNodes] = useState<SkillNode[]>([]);

  useEffect(() => {
    api.getSkillMap().then(setNodes).catch(console.error);
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Skill Map...</p>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'mastered':
        return { icon: <CheckCircle2 className="w-6 h-6" />, color: 'bg-green-50 border-green-200 text-green-700', bar: 'bg-green-500', label: 'Mastered' };
      case 'learning':
        return { icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-50 border-blue-200 text-blue-700', bar: 'bg-blue-500', label: 'In Progress' };
      case 'needs_practice':
        return { icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-amber-50 border-amber-200 text-amber-700', bar: 'bg-amber-500', label: 'Needs Practice' };
      default:
        return { icon: <Lock className="w-6 h-6" />, color: 'bg-slate-50 border-slate-200 text-slate-400 opacity-70', bar: 'bg-slate-300', label: 'Locked' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Map className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">SkillQuest Mastery Map</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Your path to fluency is structured around the exact topics you need for your relocation. Master each node to unlock advanced real-world scenarios.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* The vertical connector line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-100 -translate-x-1/2 rounded-full hidden md:block z-0"></div>

        <div className="space-y-12 relative z-10">
          {nodes.map((node, i) => {
            const isEven = i % 2 === 0;
            const config = getStatusConfig(node.status);

            return (
              <div key={node.id} className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                {/* Spacer for one side */}
                <div className="hidden md:block md:w-1/2"></div>
                
                {/* The Node Icon (Center) */}
                <div className="hidden md:flex w-16 h-16 shrink-0 bg-white border-4 border-slate-100 rounded-full items-center justify-center z-10 shadow-sm">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color.split(' ')[0]} ${config.color.split(' ')[2]}`}>
                    {config.icon}
                  </div>
                </div>

                {/* The Card */}
                <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-8' : 'md:pl-8'}`}>
                  <div className={`p-6 md:p-8 rounded-3xl border-2 shadow-sm transition-all hover:shadow-md ${config.color}`}>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">{config.label}</div>
                        <h3 className="text-2xl font-black mb-2">{node.title}</h3>
                      </div>
                      <div className="md:hidden w-12 h-12 rounded-full flex items-center justify-center bg-white/50 shrink-0">
                        {config.icon}
                      </div>
                    </div>
                    
                    <p className="font-medium opacity-90 leading-relaxed mb-6">{node.description}</p>
                    
                    {node.status !== 'locked' && (
                      <div className="space-y-2 bg-white/50 p-4 rounded-2xl">
                        <div className="flex justify-between text-sm font-bold">
                          <span>Mastery</span>
                          <span>{node.mastery_percentage}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${config.bar} rounded-full transition-all duration-1000`} 
                            style={{ width: `${node.mastery_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
