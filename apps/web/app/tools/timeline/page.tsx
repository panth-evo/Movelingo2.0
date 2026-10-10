"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TimelineEvent } from '@/lib/types';
import { CalendarDays, CheckCircle2, Circle, Clock, Plane, BookOpen, Briefcase } from 'lucide-react';

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('timeline_toggled');
    if (saved) {
      try { setToggled(JSON.parse(saved)); } catch (e) {}
    }
    api.getTimeline().then(setEvents).catch(console.error);
  }, []);

  const handleToggle = (id: string, originalStatus: string) => {
    setToggled(prev => {
      const isCurrentlyCompleted = prev[id] ?? (originalStatus === 'completed');
      const next = { ...prev, [id]: !isCurrentlyCompleted };
      localStorage.setItem('timeline_toggled', JSON.stringify(next));
      return next;
    });
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Timeline...</p>
      </div>
    );
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'language': return { icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100', border: 'border-blue-600' };
      case 'relocation': return { icon: <Plane className="w-5 h-5" />, color: 'text-purple-600 bg-purple-100', border: 'border-purple-600' };
      default: return { icon: <Briefcase className="w-5 h-5" />, color: 'text-slate-600 bg-slate-100', border: 'border-slate-600' };
    }
  };

  const getStatusIcon = (status: string, color: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className={`w-8 h-8 ${color.split(' ')[0]} cursor-pointer hover:scale-110 transition-transform`} />;
      case 'current': return <div className="relative flex h-8 w-8 items-center justify-center cursor-pointer hover:scale-110 transition-transform"><div className={`absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping ${color.split(' ')[1]}`}></div><Clock className={`relative w-8 h-8 ${color.split(' ')[0]}`} /></div>;
      default: return <Circle className={`w-8 h-8 text-slate-300 cursor-pointer hover:text-slate-400 transition-colors hover:scale-110`} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CalendarDays className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">Relocation Gantt Timeline</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Your language learning milestones perfectly synchronized with your visa application deadlines.
        </p>
      </div>

      <div className="relative pl-8 sm:pl-32 py-6">
        {/* The vertical line */}
        <div className="absolute left-12 sm:left-[144px] top-0 bottom-0 w-1 bg-slate-200 rounded-full z-0"></div>

        <div className="space-y-12 relative z-10">
          {events.map((ev) => {
            const config = getTypeConfig(ev.type);
            const dateObj = new Date(ev.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const isCompleted = toggled[ev.id] ?? (ev.status === 'completed');
            const effectiveStatus = isCompleted ? 'completed' : (ev.status === 'current' ? 'current' : 'upcoming');

            return (
              <div key={ev.id} className="relative flex items-start group">
                {/* Date Label (Desktop) */}
                <div className="hidden sm:block absolute -left-36 top-1 text-right w-24">
                  <div className="text-sm font-black text-slate-500 uppercase tracking-widest">{formattedDate}</div>
                </div>

                {/* Node Icon */}
                <div 
                  className="absolute -left-4 sm:left-[-15px] bg-white p-1 rounded-full z-20"
                  onClick={() => handleToggle(ev.id, ev.status)}
                >
                  {getStatusIcon(effectiveStatus, config.color)}
                </div>

                {/* Event Card */}
                <div className="ml-10 sm:ml-12 w-full">
                  {/* Date Label (Mobile) */}
                  <div className="sm:hidden text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{formattedDate}</div>
                  
                  <div 
                    onClick={() => handleToggle(ev.id, ev.status)}
                    className={`p-6 rounded-2xl border-2 transition-all shadow-sm cursor-pointer ${effectiveStatus === 'completed' ? 'bg-slate-50 border-slate-100 opacity-70' : effectiveStatus === 'current' ? `bg-white ${config.border} shadow-md scale-[1.02]` : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {ev.type}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{ev.title}</h3>
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
