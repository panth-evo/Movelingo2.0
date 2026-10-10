/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from 'react';
import { ExamPaper } from '@/lib/types';
import { ItemRenderer } from '@/components/exam/ItemRenderer';
import { Play, Volume2, Lock } from 'lucide-react';

type ExamPart = ExamPaper['sections'][0]['parts'][0];

export function ListeningPlayer({ part, answers, onChange }: { part: ExamPart; answers: Record<string, string>; onChange: (id: string, v: string) => void }) {
  const [previewLeft, setPreviewLeft] = useState(part.audio?.preview_seconds || 0);
  const [playsLeft, setPlaysLeft] = useState<Record<string, number>>({});
  const [playingSegment, setPlayingSegment] = useState<string | null>(null);
  
  // Initialize play limits
  useEffect(() => {
    if (!part.audio) return;
    const limits: Record<string, number> = {};
    part.audio.segments.forEach(seg => {
      limits[seg.segment_id] = seg.play_limit;
    });
    setPlaysLeft(limits);
    setPreviewLeft(part.audio.preview_seconds);
    
    // Warm up speech synthesis voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, [part]);

  // Preview countdown
  useEffect(() => {
    if (previewLeft <= 0) return;
    const timer = setInterval(() => {
      setPreviewLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [previewLeft]);

  const speakText = async (text: string, lang: string, voiceHint: string) => {
    return new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      
      const voices = window.speechSynthesis.getVoices();
      // Try to find a voice that matches lang and hint (e.g., 'male' or 'female')
      const matches = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
      if (matches.length > 0) {
        const hinted = matches.find(v => v.name.toLowerCase().includes(voiceHint.toLowerCase()));
        u.voice = hinted || matches[0];
      }
      
      u.onend = () => {
        setTimeout(resolve, 600); // 600ms natural pause between speakers
      };
      u.onerror = () => resolve(); // continue on error to not break the chain
      
      window.speechSynthesis.speak(u);
    });
  };

  const handlePlay = async (segmentId: string) => {
    if (playingSegment || previewLeft > 0 || (playsLeft[segmentId] || 0) <= 0) return;
    
    setPlayingSegment(segmentId);
    setPlaysLeft(prev => ({ ...prev, [segmentId]: Math.max(0, prev[segmentId] - 1) }));

    const segment = part.audio?.segments.find(s => s.segment_id === segmentId);
    if (!segment || !part.audio) {
      setPlayingSegment(null);
      return;
    }

    try {
      // 1. Try real API audio file first
      const res = await fetch(`/api/audio/${part.part_id}/${segmentId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject();
          audio.play().catch(reject);
        });
        
        setPlayingSegment(null);
        return;
      }
    } catch (e) {
      // Fallback to TTS engine
    }

    // 2. Fallback to Browser TTS
    window.speechSynthesis.cancel(); // Stop any ongoing ghost speech
    for (const line of segment.script) {
      await speakText(line.text, part.audio.lang, line.voice_hint);
    }
    
    setPlayingSegment(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-3xl font-black text-slate-900 mb-3">{part.title}</h2>
        {part.instructions && (
          <div className="bg-blue-50 text-blue-900 px-5 py-4 rounded-xl text-sm font-bold border border-blue-100 mb-4">
            {part.instructions}
          </div>
        )}
        
        {previewLeft > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-center justify-between text-orange-800 shadow-sm">
            <span className="font-bold flex items-center gap-2">
              <Lock className="w-5 h-5"/> Read the questions now. Audio locked.
            </span>
            <span className="text-3xl font-black tabular-nums">{previewLeft}s</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {part.audio?.segments.map((seg, i) => {
          const left = playsLeft[seg.segment_id] ?? seg.play_limit;
          const isPlaying = playingSegment === seg.segment_id;
          
          return (
            <div key={seg.segment_id} className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isPlaying ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${isPlaying ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Audio Track {i + 1}</h4>
                  <p className="text-sm font-medium mt-0.5">
                    <span className="text-slate-500">Plays left: </span>
                    <span className={`font-black ${left === 0 ? 'text-red-500' : 'text-slate-900'}`}>{left}</span> 
                    <span className="text-slate-400"> / {seg.play_limit}</span>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handlePlay(seg.segment_id)}
                disabled={previewLeft > 0 || left <= 0 || playingSegment !== null}
                className={`px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto ${
                  isPlaying ? 'bg-green-100 text-green-700 ring-2 ring-green-400 ring-offset-2' :
                  (previewLeft > 0 || left <= 0 || playingSegment !== null) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                  'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg'
                }`}
              >
                {isPlaying ? <Volume2 className="w-5 h-5 animate-pulse"/> : <Play className="w-5 h-5" />}
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="space-y-10 pt-8 mt-8 border-t border-slate-200">
        <h3 className="font-black text-2xl text-slate-900">Questions</h3>
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
