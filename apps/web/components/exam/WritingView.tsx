"use client";
import { ExamPaper } from '@/lib/types';

type ExamPart = ExamPaper['sections'][0]['parts'][0];

interface Props {
  part: ExamPart;
  textValue: string;
  onChangeText: (val: string) => void;
}

export function WritingView({ part, textValue, onChangeText }: Props) {
  const task = part.task;
  if (!task || task.kind !== 'writing') return null;

  const words = textValue.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isTooShort = task.min_words && words < task.min_words;
  const isTooLong = task.max_words && words > task.max_words;
  const wordStatus = isTooShort ? 'text-red-500' : isTooLong ? 'text-orange-500' : 'text-green-600';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-black text-slate-900 mb-3">{part.title}</h2>
        <div className="bg-indigo-50 text-indigo-900 p-5 rounded-2xl text-[1.05rem] font-medium border border-indigo-100 shadow-sm">
          {task.prompt}
        </div>
      </div>
      
      {task.bullet_points && task.bullet_points.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-widest text-xs">Requirement Checklist</h4>
          <ul className="space-y-3 text-sm">
            {task.bullet_points.map((bp, i) => (
              <li key={i} className="flex gap-3 items-start p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="font-medium text-slate-700">{bp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <textarea 
          className="w-full h-80 border-2 border-slate-200 rounded-2xl p-6 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none transition-all"
          placeholder="Start typing your response here..."
          value={textValue}
          onChange={(e) => onChangeText(e.target.value)}
        />
        <div className="flex justify-between items-center mt-3 px-2 text-sm font-black tracking-wide text-slate-400">
          <div>
            Word count: <span className={wordStatus}>{words}</span> 
            {task.min_words && <span className="text-slate-400 font-medium ml-1">/ {task.min_words} min</span>}
            {task.max_words && <span className="text-slate-400 font-medium ml-1">/ {task.max_words} max</span>}
          </div>
          {(isTooShort || isTooLong) && (
            <span className={wordStatus}>
              {isTooShort ? 'Need more words!' : 'Exceeded word limit!'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
