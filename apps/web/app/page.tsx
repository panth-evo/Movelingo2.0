"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Plane, MapPin, Target, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const countries = [
    { code: 'DE', name: 'German', target: 'Germany', flag: '🇩🇪', color: 'text-amber-500' },
    { code: 'ES', name: 'Spanish', target: 'Spain', flag: '🇪🇸', color: 'text-orange-500' },
    { code: 'FR', name: 'French', target: 'France', flag: '🇫🇷', color: 'text-blue-500' },
    { code: 'IT', name: 'Italian', target: 'Italy', flag: '🇮🇹', color: 'text-green-500' },
  ];

  return (
    <div className="flex flex-col items-center w-full pb-20 animate-in fade-in duration-700">
      
      {/* Hero Section (Duolingo Style Split) */}
      <section className="min-h-[75vh] w-full flex items-center justify-center px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center w-full">
          {/* Left: Mascot/Graphic */}
          <div className="flex justify-center order-2 md:order-1">
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
              <Image src="/mascot.png?v=5" alt="Movelingo Mascot" width={400} height={400} className="w-full h-full object-contain rounded-[3rem] shadow-2xl border-4 border-white" priority />
              <div className="absolute top-4 right-0 md:-right-8 bg-white px-6 py-4 rounded-2xl rounded-bl-none shadow-xl border-2 border-slate-200 font-extrabold text-slate-700 text-lg animate-pulse z-10" style={{ animationDuration: '2.5s' }}>
                Move fast. Learn right.
              </div>
            </div>
          </div>

          {/* Right: Copy & CTA */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 order-1 md:order-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#4b4b4b] tracking-tight leading-tight">
              The free, fun, and effective way to <span className="text-[#1cb0f6]">move abroad!</span>
            </h1>
            
            <div className="w-full flex flex-col gap-4 sm:w-80">
              <Link href="#start" className="w-full text-center uppercase tracking-widest font-extrabold text-white bg-[#58cc02] hover:bg-[#46a302] border-b-4 border-[#58a700] hover:border-[#46a302] active:border-b-0 active:translate-y-1 rounded-2xl py-4 text-sm transition-all shadow-sm">
                Get Started
              </Link>
              <Link href="/dashboard" className="w-full text-center uppercase tracking-widest font-extrabold text-[#1cb0f6] bg-white border-2 border-[#e5e5e5] hover:bg-slate-50 border-b-4 hover:border-b-4 active:border-b-0 active:translate-y-1 rounded-2xl py-4 text-sm transition-all shadow-sm">
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Language / Country Selection */}
      <section id="start" className="w-full max-w-5xl mx-auto mt-20 pt-16 border-t-2 border-[#e5e5e5] px-4 space-y-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b]">Where do you want to move?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {countries.map((c) => (
            <Link 
              key={c.code} 
              href={`/onboarding?country=${c.code}`} 
              className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#e5e5e5] rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{c.flag}</div>
              <h3 className="text-xl font-bold text-[#4b4b4b]">{c.target}</h3>
              <p className={`font-extrabold uppercase tracking-widest text-xs mt-2 ${c.color}`}>{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works features */}
      <section className="w-full max-w-5xl mx-auto mt-32 px-4 space-y-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-[#ce82ff] text-white rounded-3xl flex items-center justify-center rotate-3 border-b-4 border-[#b063e6] shadow-sm">
              <MapPin size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-[#4b4b4b]">1. Pick your route</h3>
            <p className="text-[#777777] font-medium text-lg leading-relaxed">Select your target country. We check exact visa requirements and the CEFR language level you need.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-[#ffc800] text-white rounded-3xl flex items-center justify-center -rotate-3 border-b-4 border-[#e5b400] shadow-sm">
              <Sparkles size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-[#4b4b4b]">2. Learn with purpose</h3>
            <p className="text-[#777777] font-medium text-lg leading-relaxed">Our AI builds a curriculum tailored entirely to your timeline and the specific topics you need to survive.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-[#ff4b4b] text-white rounded-3xl flex items-center justify-center rotate-3 border-b-4 border-[#e53a3a] shadow-sm">
              <Target size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-[#4b4b4b]">3. Move with confidence</h3>
            <p className="text-[#777777] font-medium text-lg leading-relaxed">Manage documents, track your budget, and ace official language exams all in one place.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

