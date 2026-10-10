"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ReviewItem } from '@/lib/types';
import { BrainCircuit, Volume2 } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    api.getReviewQueue().then(setQueue).catch(console.error);
  }, []);

  if (queue.length === 0 && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Review Queue...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <BrainCircuit className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">Queue Cleared!</h1>
        <p className="text-xl text-slate-500 mb-8 font-medium">You reviewed all your pending items. Spaced repetition works best when done daily.</p>
        <Link href="/dashboard" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const item = queue[idx];

  const handleGrade = async (grade: number) => {
    await api.submitReview(item.item_id, grade);
    if (idx < queue.length - 1) {
      setIdx(prev => prev + 1);
      setShowAnswer(false);
      setInputVal('');
    } else {
      setIsFinished(true);
    }
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(item.answer);
    utterance.lang = 'de-DE';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-purple-600" /> ForgetLess Review
        </h1>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-lg">
          Item {idx + 1} / {queue.length}
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 m-6">
          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-purple-200">
            {item.type}
          </span>
        </div>

        <div className="space-y-6 mt-4">
          {item.context && (
            <div className="text-slate-400 font-medium text-sm uppercase tracking-widest">Context: {item.context}</div>
          )}

          {item.type === 'dictation' ? (
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900">{item.prompt}</h2>
              <button onClick={playAudio} className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                <Volume2 className="w-8 h-8" />
              </button>
            </div>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{item.prompt}</h2>
          )}

          {!showAnswer ? (
            <div className="pt-8">
              {item.type === 'flashcard' ? (
                <button onClick={() => setShowAnswer(true)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-5 rounded-2xl font-black text-xl transition-colors border-2 border-slate-200">
                  Show Answer
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full text-2xl p-4 border-b-4 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors rounded-t-xl font-medium"
                    onKeyDown={e => e.key === 'Enter' && setShowAnswer(true)}
                  />
                  <button onClick={() => setShowAnswer(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg transition-colors">
                    Check
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                <div className="text-green-800 text-sm font-black uppercase tracking-widest mb-2">Answer</div>
                <div className="text-2xl font-black text-green-900">{item.answer}</div>
                {item.type !== 'flashcard' && inputVal && (
                  <div className="mt-4 pt-4 border-t border-green-200/50">
                    <div className="text-sm font-bold text-slate-500">You typed: <span className={inputVal.trim().toLowerCase() === item.answer.trim().toLowerCase() ? 'text-green-600' : 'text-red-500'}>{inputVal}</span></div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-center text-slate-500 font-bold uppercase tracking-widest text-sm">How hard was this?</div>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => handleGrade(1)} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-4 rounded-xl font-bold transition-colors">Hard</button>
                  <button onClick={() => handleGrade(3)} className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 py-4 rounded-xl font-bold transition-colors">Good</button>
                  <button onClick={() => handleGrade(5)} className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-4 rounded-xl font-bold transition-colors">Easy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
