"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Type, Camera, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function CapturePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !text) return;
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (text) formData.append('text', text);
      
      const res = await api.uploadCapture(formData);
      router.push(`/learn/lesson/${res.lesson_id}`);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Real-World Capture</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Snap a photo of a rental contract, a street sign, or an official visa letter. Our engine will extract the vocabulary and grammar you need to understand it.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-5 flex justify-center items-center gap-3 font-bold text-lg transition-colors ${activeTab === 'upload' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Camera className="w-5 h-5" /> Image / PDF
          </button>
          <button 
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-5 flex justify-center items-center gap-3 font-bold text-lg transition-colors ${activeTab === 'text' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Type className="w-5 h-5" /> Paste Text
          </button>
        </div>

        <div className="p-8 sm:p-12">
          {activeTab === 'upload' ? (
            <div className="relative border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center py-24 text-center cursor-pointer group">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" />
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {file ? file.name : 'Drag & drop or click to upload'}
              </h3>
              <p className="text-slate-500 font-medium text-lg">
                {file ? 'File ready to process' : 'Supports JPG, PNG, or PDF'}
              </p>
            </div>
          ) : (
            <div>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the text from an email, letter, or article here..."
                className="w-full h-80 rounded-3xl border-2 border-slate-200 p-8 text-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={handleAnalyze}
            disabled={(!file && !text) || isProcessing}
            className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Document...</>
            ) : (
              <>Analyze & Build Lesson <ArrowRight className="w-6 h-6" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
