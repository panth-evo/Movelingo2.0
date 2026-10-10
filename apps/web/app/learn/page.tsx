import Link from 'next/link';
import { BookOpen, Mic, BrainCircuit, Activity, CheckCircle2, RotateCcw } from 'lucide-react';

export default function LearnHub() {
  const modules = [
    { name: "Skill Map", href: "/learn/skill-map", icon: <BookOpen size={32} />, desc: "Your complete curriculum", color: "bg-[#58cc02]", border: "border-[#58a700]" },
    { name: "Capture & Scan", href: "/learn/capture", icon: <CheckCircle2 size={32} />, desc: "Upload docs or photos for translation", color: "bg-[#1cb0f6]", border: "border-[#1899d6]" },
    { name: "Daily Practice", href: "/learn/practice", icon: <Activity size={32} />, desc: "Targeted exercises for your weaknesses", color: "bg-[#ffc800]", border: "border-[#e5b400]" },
    { name: "TeachBack", href: "/learn/teachback", icon: <Mic size={32} />, desc: "Explain concepts by voice", color: "bg-[#ce82ff]", border: "border-[#b063e6]" },
    { name: "Review Queue", href: "/learn/review", icon: <RotateCcw size={32} />, desc: "Spaced repetition scheduler", color: "bg-[#ff4b4b]", border: "border-[#e53a3a]" },
    { name: "AI Tutor", href: "/learn/lesson/1", icon: <BrainCircuit size={32} />, desc: "Interactive conversational practice", color: "bg-[#00cdd0]", border: "border-[#00b2b5]" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-[#4b4b4b]">Learning Hub</h1>
        <p className="text-lg text-[#777777] font-medium">Choose a module to continue your training.</p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {modules.map((m) => (
          <Link href={m.href} key={m.name} className="group relative bg-white border-2 border-[#e5e5e5] rounded-2xl p-8 text-center border-b-4 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all">
            <div className={`w-20 h-20 mx-auto ${m.color} text-white rounded-3xl flex items-center justify-center mb-6 border-b-4 ${m.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              {m.icon}
            </div>
            <h3 className="text-2xl font-extrabold text-[#4b4b4b] mb-2">{m.name}</h3>
            <p className="text-[#777777] font-medium text-sm leading-relaxed">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
