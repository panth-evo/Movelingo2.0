import { ExamPaper } from '@/lib/types';
import { ItemRenderer } from '@/components/exam/ItemRenderer';

type ExamPart = ExamPaper['sections'][0]['parts'][0];

interface Props {
  part: ExamPart;
  answers: Record<string, string>;
  onChange: (id: string, val: string) => void;
}

export function ReadingView({ part, answers, onChange }: Props) {
  const hasPassage = part.passage && part.passage.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-black text-slate-900 mb-3">{part.title}</h2>
        {part.instructions && (
          <div className="bg-blue-50 text-blue-900 px-5 py-4 rounded-xl text-sm font-bold border border-blue-100">
            {part.instructions}
          </div>
        )}
      </div>

      <div className={`grid gap-12 items-start ${hasPassage ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* PASSAGE */}
        {hasPassage && (
          <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-800 lg:sticky top-6 break-words min-w-0 overflow-hidden">
            {Array.isArray(part.passage) 
              ? part.passage.map((p, i) => (
                  <p key={i} className="mb-4 last:mb-0 text-[1.05rem]">{p}</p>
                ))
              : <p className="mb-4 last:mb-0 text-[1.05rem]">{part.passage}</p>
            }
          </div>
        )}

        {/* ITEMS */}
        <div className="space-y-10">
          {part.items.map((item, idx) => (
            <div key={item.item_id} className="relative">
              <div className="absolute -left-10 top-0 text-slate-200 font-black text-4xl select-none leading-none -mt-1 hidden sm:block z-0">{idx + 1}</div>
              <div className="relative z-10 bg-white sm:bg-transparent">
                <ItemRenderer 
                  item={item} 
                  value={answers[item.item_id] || ''} 
                  onChange={(val) => onChange(item.item_id, val)} 
                />
              </div>
            </div>
          ))}
          {part.items.length === 0 && (
            <div className="text-slate-400 font-bold py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              No questions found for this part.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
