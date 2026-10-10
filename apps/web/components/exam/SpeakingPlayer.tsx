/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";
import { ExamPaper } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Mic, Square, MessageSquare, AlertCircle } from 'lucide-react';

type ExamPart = ExamPaper['sections'][0]['parts'][0];

interface Props {
  part: ExamPart;
  lang: string;
  onFinish: (id: string, transcript: string, duration: number) => void;
}

export function SpeakingPlayer({ part, lang, onFinish }: Props) {
  const task = part.task;
  const [prepTime, setPrepTime] = useState(task?.prep_seconds || 0);
  const [speakTime, setSpeakTime] = useState(task?.speaking_seconds || 0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  const [transcript, setTranscript] = useState('');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [chatLog, setChatLog] = useState<{speaker: string, text: string}[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  
  // Prep countdown
  useEffect(() => {
    if (prepTime <= 0 || hasFinished) return;
    const t = setInterval(() => setPrepTime(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [prepTime, hasFinished]);

  // Speaking countdown
  useEffect(() => {
    if (!isRecording || speakTime <= 0 || hasFinished) return;
    const t = setInterval(() => {
      setSpeakTime(p => {
        if (p <= 1) {
          stopRecording();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, speakTime, hasFinished]);

  const startRecording = () => {
    setIsRecording(true);
    setPrepTime(0); // Cancel prep if they start early
    startTimeRef.current = Date.now();
    
    // Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      let bcp47 = 'en-US';
      if (lang === 'de') bcp47 = 'de-DE';
      if (lang === 'es') bcp47 = 'es-ES';
      if (lang === 'fr') bcp47 = 'fr-FR';
      if (lang === 'it') bcp47 = 'it-IT';
      
      recognition.lang = bcp47;
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalStr += event.results[i][0].transcript;
        }
        if (finalStr) {
          setTranscript(prev => prev + ' ' + finalStr);
          setEditableTranscript(prev => prev + ' ' + finalStr); // keep fallback in sync
        }
      };
      
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setHasFinished(true);
    
    const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalTx = editableTranscript || transcript;
    onFinish(part.part_id, finalTx, dur);
    
    // Simulate partnerTurn()
    setChatLog([
      { speaker: 'You', text: finalTx || '(No audio recorded, using manual fallback)' },
      { speaker: 'Examiner', text: 'Thank you. That completes this section.' }
    ]);
  };

  if (!task || task.kind !== 'speaking') return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-black text-slate-900 mb-3">{part.title}</h2>
        <div className="bg-purple-50 p-5 rounded-2xl text-[1.05rem] text-purple-900 font-bold border border-purple-100 shadow-sm">
          {task.prompt}
        </div>
        {task.bullet_points && (
          <ul className="mt-4 space-y-2">
            {task.bullet_points.map((bp, i) => (
              <li key={i} className="flex gap-2 items-center text-sm font-medium text-slate-600">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"/> {bp}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {!hasFinished && prepTime > 0 ? (
        <div className="bg-orange-50 border-orange-200 p-8 rounded-3xl border-2 text-center space-y-6 shadow-sm">
          <h3 className="font-black text-orange-900 uppercase tracking-widest text-sm">Preparation Time</h3>
          <div className="text-6xl font-black tabular-nums text-orange-900 drop-shadow-sm">{prepTime}s</div>
          <div className="max-w-md mx-auto text-left">
            <label className="block text-xs font-bold text-orange-700 uppercase mb-2">Scratchpad (Not Graded)</label>
            <textarea 
              className="w-full h-32 rounded-xl border-orange-200 p-4 bg-white focus:ring-orange-300 focus:border-orange-300 transition-all resize-none" 
              placeholder="Type your notes here..."
            />
          </div>
          <button onClick={startRecording} className="mt-4 bg-slate-900 text-white hover:bg-slate-800 px-8 py-3 rounded-xl font-bold transition-all shadow-md">
            Skip Prep & Start
          </button>
        </div>
      ) : !hasFinished ? (
        <div className="space-y-6">
          <div className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-colors ${isRecording ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`font-black text-xl tabular-nums ${isRecording ? 'text-red-700' : 'text-slate-900'}`}>
              Time Remaining: {speakTime}s
            </div>
            {!isRecording ? (
              <button onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                <Mic className="w-6 h-6" /> Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 animate-pulse">
                <Square className="w-6 h-6 fill-current text-red-500" /> Stop Recording
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4"/> Live Transcript
              </h4>
              <div className="flex-1 bg-slate-50 rounded-xl p-4 text-slate-800 font-medium italic min-h-[150px] overflow-y-auto">
                {transcript || <span className="text-slate-400 not-italic">Waiting for you to speak...</span>}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4"/> Manual Fallback
              </h4>
              <textarea 
                value={editableTranscript}
                onChange={e => setEditableTranscript(e.target.value)}
                className="flex-1 w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 font-medium focus:bg-white focus:border-blue-400 focus:ring-0 transition-colors resize-none min-h-[150px]"
                placeholder="If your microphone fails, type your answer here before stopping..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-green-200 p-8 rounded-3xl text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8" />
          </div>
          <h3 className="font-black text-2xl text-slate-900">Recording Finished</h3>
          
          {chatLog.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 max-w-xl mx-auto text-left">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4"/> Examiner Chat Simulation
              </h4>
              {chatLog.map((c, i) => (
                <div key={i} className={`p-4 rounded-xl font-medium ${c.speaker === 'You' ? 'bg-blue-100 text-blue-900 ml-12 rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 mr-12 rounded-tl-sm shadow-sm'}`}>
                  <strong className="block text-[10px] uppercase tracking-widest opacity-60 mb-1">{c.speaker}</strong>
                  {c.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
