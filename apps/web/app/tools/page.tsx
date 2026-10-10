import Link from 'next/link';
import { Calendar, CheckSquare, Calculator, FileText, Compass, Scale } from 'lucide-react';

export default function ToolsHub() {
  const tools = [
    { name: "Visa Timeline", href: "/tools/timeline", icon: <Calendar size={32} />, desc: "Gantt view of your relocation steps", color: "bg-[#1cb0f6]", border: "border-[#1899d6]" },
    { name: "Checklists", href: "/tools/checklist", icon: <CheckSquare size={32} />, desc: "Arrival and departure tasks", color: "bg-[#ffc800]", border: "border-[#e5b400]" },
    { name: "Budget Calculator", href: "/dashboard/move-plan", icon: <Calculator size={32} />, desc: "Monthly and one-time costs", color: "bg-[#58cc02]", border: "border-[#58a700]" },
    { name: "Doc Vault", href: "/dashboard/documents", icon: <FileText size={32} />, desc: "Upload and verify requirements", color: "bg-[#ff4b4b]", border: "border-[#e53a3a]" },
    { name: "City Simulator", href: "/tools/simulator", icon: <Compass size={32} />, desc: "Explore cost of living and jobs", color: "bg-[#ce82ff]", border: "border-[#b063e6]" },
    { name: "Compare Routes", href: "/tools/compare", icon: <Scale size={32} />, desc: "Side-by-side visa comparison", color: "bg-[#00cdd0]", border: "border-[#00b2b5]" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-[#4b4b4b]">Relocation Tools</h1>
        <p className="text-lg text-[#777777] font-medium">Everything you need to plan your move with confidence.</p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tools.map((t) => (
          <Link href={t.href} key={t.name} className="group relative bg-white border-2 border-[#e5e5e5] rounded-2xl p-8 text-center border-b-4 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all">
            <div className={`w-20 h-20 mx-auto ${t.color} text-white rounded-3xl flex items-center justify-center mb-6 border-b-4 ${t.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              {t.icon}
            </div>
            <h3 className="text-2xl font-extrabold text-[#4b4b4b] mb-2">{t.name}</h3>
            <p className="text-[#777777] font-medium text-sm leading-relaxed">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
