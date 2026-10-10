"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ExamPaper } from '@/lib/types';
import { PlayerShell } from '@/components/exam/PlayerShell';

export default function ExamPlayerPage({ params }: { params: { paperId: string } }) {
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPaper(params.paperId).then(setPaper).catch(e => {
      console.error(e);
      setError("Could not load paper. It might not exist.");
    });
  }, [params.paperId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-50">
        <div className="text-red-500 font-bold">{error}</div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-bold tracking-widest uppercase text-sm">Loading exam paper...</div>
      </div>
    );
  }

  return <PlayerShell paper={paper} />;
}
