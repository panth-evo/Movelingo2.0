"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { User, ShieldAlert, Send, Mic, StopCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function SimulatorSessionPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [history, setHistory] = useState<Array<{role: string, text: string}>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    api.startSimulator(id).then(res => {
      setHistory([{ role: 'examiner', text: res.initial_message }]);
      setIsTyping(false);
    }).catch(console.error);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'de-DE';

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
  }, [id]);

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
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...history, { role: 'candidate', text: userText }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      // Reuse the exam partner turn mock for chat replies
      const res = await api.partnerTurn({ paper_id: id, part_id: 'simulator', history: newHistory });
      setHistory([...newHistory, { role: 'examiner', text: res.reply_text }]);
    } catch (e) {
      console.error(e);
      setHistory([...newHistory, { role: 'examiner', text: "Entschuldigung, ich habe Sie nicht verstanden. Bitte wiederholen Sie das." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col pt-8 pb-4 px-4">
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-slate-600" /> Scenario: {id.toUpperCase()}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Roleplaying with the official clerk.</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50">
          {history.length === 0 && isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'candidate' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold uppercase tracking-wider">
                  {msg.role === 'candidate' ? <User className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                  {msg.role === 'candidate' ? 'You' : 'Clerk'}
                </div>
                <div className="text-lg leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
          {history.length > 0 && isTyping && (
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
              placeholder={isRecording ? "Listening (speak German)..." : "Type your reply here..."}
              className={`flex-1 border-2 rounded-xl p-4 resize-none transition-colors focus:outline-none focus:ring-0 ${
                isRecording ? 'border-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-slate-200 focus:border-blue-400 focus:bg-blue-50'
              }`}
              rows={2}
              disabled={isRecording}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isRecording}
              className="px-6 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
