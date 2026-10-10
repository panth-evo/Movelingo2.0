/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useOnboarding } from '@/app/onboarding/OnboardingContext';
import { useState } from 'react';
import { api } from '@/lib/api';
import { ProfileInput } from '@/lib/types';

export function StepForms() {
  const { currentStep, nextStep, prevStep, data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 7) {
      nextStep();
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.createUser();
      localStorage.setItem('user_id', res.user_id);
      
      const countryMap: Record<string, string> = { 'DE': 'de', 'ES': 'es', 'FR': 'fr', 'IT': 'it' };
      const lang = data.goal?.target_country ? countryMap[data.goal.target_country] : 'de';
      
      const finalData: ProfileInput = {
        age: data.age ?? 30,
        nationality: data.nationality ?? 'Unknown',
        current_country: data.current_country ?? 'Unknown',
        passport_valid_until: data.passport_valid_until ?? '2030-01-01',
        marital_status: data.marital_status ?? 'Single',
        dependants: data.dependants ?? 0,
        education: { highest: 'Bachelor', field: 'IT', university: 'N/A', graduation_year: 2020, grade: 'A', ...(data.education || {}) },
        work: { profession: 'Software', years_experience: 5, salary_range: '50k', job_offer: false, sponsor: false, ...(data.work || {}) },
        goal: { purpose: 'work', target_country: 'DE', target_city: 'Berlin', move_deadline: '2025-01-01', ...(data.goal || {}) },
        finance: { savings_eur: 5000, monthly_budget_eur: 1500, open_to_loans: false, ...(data.finance || {}) },
        languages_known: data.languages_known || [],
        study: { hours_per_day: 1, style: 'visual', device: 'laptop', weakest_skill: 'speaking', ...(data.study || {}) }
      };
      
      await api.updateProfile(res.user_id, finalData);
      localStorage.setItem('target_language', lang);
      nextStep();
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Make sure the API is running or Fixtures are enabled.");
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">Age<input type="number" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.age || ''} onChange={e => updateData({age: parseInt(e.target.value) || null})} required /></label>
              <label className="block text-sm font-medium">Nationality<input type="text" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.nationality || ''} onChange={e => updateData({nationality: e.target.value})} required /></label>
              <label className="block text-sm font-medium">Current Country<input type="text" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.current_country || ''} onChange={e => updateData({current_country: e.target.value})} required /></label>
              <label className="block text-sm font-medium">Passport Valid Until<input type="date" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.passport_valid_until || ''} onChange={e => updateData({passport_valid_until: e.target.value})} required /></label>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold">Education</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">Highest Degree<input type="text" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.education?.highest || ''} onChange={e => updateData({education: { highest: e.target.value } as any})} required /></label>
              <label className="block text-sm font-medium">Field of Study<input type="text" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.education?.field || ''} onChange={e => updateData({education: { field: e.target.value } as any})} required /></label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold">Work Experience</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">Profession<input type="text" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.work?.profession || ''} onChange={e => updateData({work: { profession: e.target.value } as any})} required /></label>
              <label className="block text-sm font-medium">Years Experience<input type="number" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.work?.years_experience || ''} onChange={e => updateData({work: { years_experience: parseInt(e.target.value) || null } as any})} required /></label>
              <label className="block flex items-center gap-2 mt-6"><input type="checkbox" checked={data.work?.job_offer || false} onChange={e => updateData({work: { job_offer: e.target.checked } as any})} /> I have a job offer</label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold">Your Goal</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">Purpose
                <select className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.goal?.purpose || ''} onChange={e => updateData({goal: { purpose: e.target.value as any } as any})} required>
                  <option value="">Select...</option><option value="work">Work</option><option value="study">Study</option><option value="settle">Settle</option>
                </select>
              </label>
              <label className="block text-sm font-medium">Target Country
                <select className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.goal?.target_country || ''} onChange={e => updateData({goal: { target_country: e.target.value as any } as any})} required>
                  <option value="">Select...</option><option value="DE">Germany</option><option value="ES">Spain</option><option value="FR">France</option><option value="IT">Italy</option>
                </select>
              </label>
              <label className="block text-sm font-medium">Move Deadline<input type="date" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.goal?.move_deadline || ''} onChange={e => updateData({goal: { move_deadline: e.target.value } as any})} required /></label>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold">Finance</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">Savings (EUR)<input type="number" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.finance?.savings_eur || ''} onChange={e => updateData({finance: { savings_eur: parseInt(e.target.value) || null } as any})} required /></label>
              <label className="block flex items-center gap-2 mt-6"><input type="checkbox" checked={data.finance?.open_to_loans || false} onChange={e => updateData({finance: { open_to_loans: e.target.checked } as any})} /> Open to loans</label>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold">Languages</h2>
            <p className="text-slate-500 text-sm">Any other languages you know?</p>
            <div className="flex gap-4 items-end">
              <label className="block w-full text-sm font-medium">Language<input type="text" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" placeholder="e.g. English" onChange={(e) => updateData({ languages_known: [{ language: e.target.value, self_level: 'B2', certificate: null }] })} /></label>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold">Learning Style</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">Hours per day<input type="number" className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.study?.hours_per_day || 1} onChange={e => updateData({study: { hours_per_day: parseInt(e.target.value) || 1 } as any})} required /></label>
              <label className="block text-sm font-medium">Weakest skill
                <select className="mt-1 block w-full rounded-md border-slate-300 p-2 border" value={data.study?.weakest_skill || 'speaking'} onChange={e => updateData({study: { weakest_skill: e.target.value } as any})}>
                  <option value="speaking">Speaking</option><option value="listening">Listening</option><option value="writing">Writing</option><option value="reading">Reading</option>
                </select>
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1">
        {renderStep()}
      </div>
      <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
        <button type="button" onClick={prevStep} disabled={currentStep === 1 || loading} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg disabled:opacity-50">Back</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 font-medium text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : currentStep === 7 ? 'Complete Profile' : 'Next Step'}
        </button>
      </div>
    </form>
  );
}
