"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { TeachBackSession } from '@/lib/types';
import { User, Bot, Send, Mic, StopCircle } from 'lucide-react';

export default function TeachBackPage() {
  const [session, setSession] = useState<TeachBackSession | null>(null);
  const [history, setHistory] = useState<Array<{role: string, text: string}>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // We could extract the concept from URL search params in reality
    api.startTeachBack('in_Höhe_von_+_Dative').then(res => {
      setSession(res);
      setHistory([{ role: 'examiner', text: `Hi! Today we are practicing the grammar rule: ${res.concept}. ${res.instructions}` }]);
    }).catch(console.error);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'de-DE'; // Enforce target language

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !session) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...history, { role: 'candidate', text: userText }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      const res = await api.partnerTurn({ paper_id: session.session_id, part_id: 'teachback', history: newHistory });
      setHistory([...newHistory, { role: 'examiner', text: res.reply_text }]);
    } catch (e) {
      console.error(e);
      setHistory([...newHistory, { role: 'examiner', text: "Ich habe dich leider nicht verstanden. Kannst du das anders erklären?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Preparing Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col pt-8 pb-4 px-4">
      <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-sm mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" /> TeachBack Mode
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Rule: <span className="font-bold text-slate-700">{session.concept}</span></p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'candidate' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold uppercase tracking-wider">
                  {msg.role === 'candidate' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {msg.role === 'candidate' ? 'You' : 'AI Tutor'}
                </div>
                <div className="text-lg leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2 relative">
            <button
              onClick={toggleRecording}
              className={`p-4 rounded-xl shrink-0 transition-colors shadow-sm border ${
                isRecording ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isRecording ? "Listening (speak German)..." : "Type your explanation here..."}
              className={`flex-1 border-2 rounded-xl p-4 resize-none transition-colors focus:outline-none focus:ring-0 ${
                isRecording ? 'border-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-slate-200 focus:border-blue-400 focus:bg-blue-50'
              }`}
              rows={2}
              disabled={isRecording}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isRecording}
              className="px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
