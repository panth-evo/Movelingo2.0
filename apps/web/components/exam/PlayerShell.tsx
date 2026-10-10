"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExamPaper, SubmitInput } from '@/lib/types';
import { api } from '@/lib/api';
import { Clock, ChevronRight } from 'lucide-react';
import { ReadingView } from './ReadingView';
import { ListeningPlayer } from './ListeningPlayer';
import { WritingView } from './WritingView';
import { SpeakingPlayer } from './SpeakingPlayer';

export function PlayerShell({ paper }: { paper: ExamPaper }) {
  const router = useRouter();
  const [secIdx, setSecIdx] = useState(0);
  const [partIdx, setPartIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [speaking, setSpeaking] = useState<Record<string, { transcript: string; duration_sec: number }>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const section = paper.sections[secIdx];
  const part = section?.parts[partIdx];

  // Restore answers from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(`exam_answers_${paper.paper_id}`);
    if (saved) setAnswers(JSON.parse(saved));
  }, [paper.paper_id]);

  // Initialize un-pausable timer when section changes
  useEffect(() => {
    if (section) setTimeLeft(section.duration_min * 60);
  }, [secIdx, section]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit at zero
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitting]);

  const updateAnswer = (id: string, val: string) => {
    setAnswers(prev => {
      const next = { ...prev, [id]: val };
      sessionStorage.setItem(`exam_answers_${paper.paper_id}`, JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!section || submitting) return;
    setSubmitting(true);
    try {
      const payload: SubmitInput = {
        skill: section.skill,
        answers: answers,
        texts: texts,
        speaking: speaking,
        time_spent_sec: (section.duration_min * 60) - (timeLeft || 0)
      };
      await api.submitExam(paper.paper_id, payload);
      
      if (secIdx < paper.sections.length - 1) {
        setSecIdx(prev => prev + 1);
        setPartIdx(0);
        setSubmitting(false);
      } else {
        sessionStorage.removeItem(`exam_answers_${paper.paper_id}`);
        router.push(`/exams/${paper.paper_id}/results`);
      }
    } catch (e) {
      console.error(e);
      // Fallback redirect on error
      router.push('/dashboard');
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!section || !part) return null;
  const isListening = section.skill === 'listening';
  const isWriting = section.skill === 'writing';
  const isSpeaking = section.skill === 'speaking';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* TOP BAR */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 shadow-lg z-10 gap-4 min-w-0">
        <div className="font-black tracking-widest uppercase flex flex-wrap items-center gap-2 sm:gap-4 min-w-0 break-words">
          <span className="text-blue-400 break-words">{paper.exam_name}</span>
          <span className="w-1.5 h-1.5 bg-slate-700 rounded-full shrink-0" />
          <span className="text-slate-100 break-words">{section.skill}</span>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className={`flex items-center gap-3 font-mono text-2xl px-5 py-2 rounded-xl transition-colors ${timeLeft && timeLeft < 60 ? 'bg-red-950 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-100'}`}>
            <Clock className={`w-5 h-5 ${timeLeft && timeLeft < 60 ? 'text-red-500' : 'text-slate-400'}`} />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
          <button 
            onClick={() => confirm('Are you sure you want to submit this section early?') && handleSubmit()}
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Section'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* SIDEBAR NAV */}
        <div className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 overflow-x-auto lg:overflow-y-auto shrink-0 flex flex-row lg:flex-col gap-3 shadow-sm z-0">
          <div className="hidden lg:block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Navigation</div>
          {section.parts.map((p, i) => (
            <button
              key={p.part_id}
              disabled={isListening && i !== partIdx} // Strict sequential fixed order for listening
              onClick={() => setPartIdx(i)}
              className={`text-left p-4 rounded-2xl border-2 transition-all min-w-[200px] lg:min-w-0 shrink-0 break-words whitespace-normal ${
                i === partIdx ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm' : 

                (isListening && i !== partIdx) ? 'bg-slate-50 border-transparent text-slate-400 opacity-50 cursor-not-allowed' :
                'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-black text-sm mb-1 uppercase tracking-wider">Part {p.part_no}</div>
              <div className={`text-xs font-medium leading-relaxed ${i === partIdx ? 'text-blue-800' : 'text-slate-500'}`}>{p.title}</div>
            </button>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[60vh]">
            {isListening ? (
              <ListeningPlayer part={part} answers={answers} onChange={updateAnswer} />
            ) : isWriting ? (
              <WritingView 
                part={part} 
                textValue={texts[part.part_id] || ''} 
                onChangeText={(val) => setTexts(prev => ({ ...prev, [part.part_id]: val }))} 
              />
            ) : isSpeaking ? (
              <SpeakingPlayer 
                part={part} 
                lang={paper.language} 
                onFinish={(id, transcript, duration) => setSpeaking(prev => ({ ...prev, [id]: { transcript, duration_sec: duration } }))} 
              />
            ) : (
              <ReadingView part={part} answers={answers} onChange={updateAnswer} />
            )}
          </div>
          
          <div className="max-w-4xl mx-auto mt-8 flex justify-end">
             {partIdx < section.parts.length - 1 ? (
                <button 
                  onClick={() => setPartIdx(partIdx + 1)}
                  className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  Continue to next part <ChevronRight className="w-5 h-5" />
                </button>
             ) : (
                <button 
                  onClick={() => confirm('Are you sure you want to submit this section?') && handleSubmit()}
                  disabled={submitting}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-sm hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Section'} <ChevronRight className="w-5 h-5" />
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
