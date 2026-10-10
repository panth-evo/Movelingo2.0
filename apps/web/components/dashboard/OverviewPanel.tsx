import { PlanResult, ProgressResponse } from '@/lib/types';
import { Calendar, Target, Flag, Clock } from 'lucide-react';

export function OverviewPanel({ plan, progress }: { plan: PlanResult; progress: ProgressResponse }) {
  const targetLevelProgress = progress.levels.find(l => l.level === progress.target_level)?.progress || 0;
  
  // Mock done milestones calculation based on fake date comparison
  const today = new Date().toISOString();
  const doneMilestones = plan.milestones.filter(m => m.due_date < today).length;
  const milestoneProgress = plan.milestones.length ? (doneMilestones / plan.milestones.length) * 100 : 0;
  
  const readiness = Math.round((targetLevelProgress + milestoneProgress) / 2);
  
  const nextMilestone = plan.milestones.find(m => m.due_date >= today) || plan.milestones[0];
  const thisWeek = plan.weekly_plan[0];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="space-y-2">
        <div className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Deadline</div>
        <div className="text-3xl font-black text-slate-900 tabular-nums">{plan.days_to_deadline} <span className="text-lg font-bold text-slate-400">days</span></div>
      </div>
      <div className="space-y-2">
        <div className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> Readiness</div>
        <div className="text-3xl font-black text-blue-600 tabular-nums">{readiness}%</div>
      </div>
      <div className="space-y-2 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
        <div className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><Flag className="w-3.5 h-3.5"/> Next Milestone</div>
        <div className="text-lg font-extrabold text-slate-900 leading-snug">{nextMilestone?.label || 'None'}</div>
        <div className="text-sm font-medium text-slate-500">{nextMilestone?.due_date}</div>
      </div>
      <div className="space-y-2 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
        <div className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> This Week</div>
        <div className="text-lg font-extrabold text-slate-900 leading-snug">{thisWeek?.focus || 'Rest'}</div>
        <div className="text-sm font-medium text-slate-500">{thisWeek?.hours}h focus on {thisWeek?.skill_focus}</div>
      </div>
    </div>
  );
}
