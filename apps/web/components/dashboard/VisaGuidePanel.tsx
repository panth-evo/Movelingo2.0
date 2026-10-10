import { PlanResult } from '@/lib/types';
import { ExternalLink, FileText, Globe, Landmark, FileCheck } from 'lucide-react';
import Link from 'next/link';

export function VisaGuidePanel({ plan }: { plan: PlanResult }) {
  const getCountryLinks = (country: string) => {
    const c = country.toLowerCase();
    if (c === 'germany' || c === 'de') {
        return {
          gov: 'https://www.auswaertiges-amt.de/en/visa-service',
          visaName: 'EU Blue Card / National Visa (D)',
          steps: [
            '1. Gather all required documents (see list below).',
            '2. Open a Blocked Account (Sperrkonto) if applying as a student/jobseeker.',
            '3. Book an appointment at the German Embassy/Consulate via their online portal.',
            '4. Submit your application in person and pay the €75 fee.',
            '5. Await processing (typically 4-12 weeks).',
            '6. Register at the Bürgeramt (Anmeldung) within 14 days of arriving in Germany.'
          ],
          requirements: [
            'Valid Passport (at least 6 months validity, 2 blank pages)',
            '2 current biometric passport photos',
            'Completed National Visa Application form (Videx)',
            'Proof of sufficient funds (Blocked account with €11,208 or employment contract)',
            'Proof of health insurance (e.g., TK, AOK, or valid travel insurance)',
            'University degree recognized in Germany (check Anabin database)',
            'Declaration regarding a contract of employment (Erklärung zum Beschäftigungsverhältnis)'
          ]
        };
    } else if (c === 'spain' || c === 'es') {
        return {
          gov: 'https://www.exteriores.gob.es/Consulados/en/Paginas/index.aspx',
          visaName: 'Digital Nomad / Work Visa',
          steps: [
            '1. Obtain a clean criminal record and a medical certificate.',
            '2. Gather proof of financial means and employment/contracts.',
            '3. Apply at the Spanish Consulate or directly in Spain (for Nomad Visa).',
            '4. Pay the processing fee (approx. €80-90).',
            '5. Wait for approval (usually 20-30 days).',
            '6. Get your TIE (Foreigner Identity Card) at the local police station after arrival.'
          ],
          requirements: [
            'Valid Passport (at least 1 year validity recommended)',
            'Criminal record certificate (Apostilled and translated within last 3-6 months)',
            'Medical certificate of good health',
            'Proof of financial means (Bank statements or valid work contract)',
            'Private or public health insurance active in Spain',
            'Proof of qualifications/degree (translated and apostilled)'
          ]
        };
    } else if (c === 'france' || c === 'fr') {
        return {
          gov: 'https://france-visas.gouv.fr/en/',
          visaName: 'Talent Passport (Passeport Talent)',
          steps: [
            '1. Check eligibility for Talent Passport categories (e.g., highly skilled).',
            '2. Gather employment contract (CERFA), degree, and ID.',
            '3. Fill out the online application on the France-Visas portal.',
            '4. Attend appointment at VFS Global / Consulate to submit biometrics.',
            '5. Receive your visa and travel to France.',
            '6. Validate your VLS-TS visa online within 3 months of arrival.'
          ],
          requirements: [
            'Valid Passport (at least 3 months beyond visa expiry)',
            'CERFA employment form approved by the French Ministry of Labor',
            'Proof of accommodation in France (lease or attestation)',
            'Detailed CV and Cover Letter',
            'Proof of payment of visa fees (€99)',
            'Translated university diplomas and transcripts'
          ]
        };
    } else if (c === 'italy' || c === 'it') {
        return {
          gov: 'https://vistoperitalia.esteri.it/home/en',
          visaName: 'National Visa (D) / Nulla Osta',
          steps: [
            '1. Your employer must request a Work Authorization (Nulla Osta) in Italy.',
            '2. Wait for the Nulla Osta approval (can take 2-4 months).',
            '3. Book an appointment at the Italian Consulate in your jurisdiction.',
            '4. Submit visa application with Nulla Osta and passport.',
            '5. Travel to Italy once visa is stamped.',
            '6. Apply for Permesso di Soggiorno within 8 days of arriving.'
          ],
          requirements: [
            'Valid Passport with at least two blank pages',
            'The original Nulla Osta (issued within the last 6 months)',
            'Long-term Visa Application Form (D-Visa)',
            'Flight itinerary or proof of travel arrangements',
            'Proof of accommodation in Italy',
            'Passport-sized photographs (ICAO standards)'
          ]
        };
    } else {
        return {
          gov: 'https://www.vfsglobal.com/',
          visaName: 'Standard Work Visa',
          steps: [
            '1. Check passport validity (must be > 6 months).',
            '2. Gather employer sponsorship documents.',
            '3. Submit application to local consulate.',
            '4. Wait for processing.',
            '5. Register your address upon arrival.'
          ],
          requirements: [
            'Valid Passport',
            'Completed Visa Application Form',
            'Employment Contract or Sponsorship Letter',
            'Proof of Financial Means',
            'Proof of Health Insurance',
            'Passport-sized photos'
          ]
        };
    }
  };

  const info = getCountryLinks(plan.target_country || 'de');
  const displayCountry = plan.target_country === 'DE' ? 'Germany' : plan.target_country === 'ES' ? 'Spain' : plan.target_country === 'FR' ? 'France' : plan.target_country === 'IT' ? 'Italy' : plan.target_country;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 mt-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <Landmark className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Official Visa Process</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Steps */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> 
            How to apply for {info.visaName}
          </h3>
          <ul className="space-y-3">
            {info.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-600">
                <span className="font-bold text-blue-600 shrink-0">{step.split('.')[0]}.</span>
                <span>{step.split('.').slice(1).join('.')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-slate-400" /> 
            Required Documents
          </h3>
          <ul className="space-y-2">
            {info.requirements.map((req, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-slate-600 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Links & Passport */}
      <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-400" /> 
            Official Verification Links
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Always verify visa requirements on the official government website. Third-party sites may have outdated information.
          </p>
          <Link href={info.gov} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mt-2">
            <ExternalLink className="w-4 h-4" />
            {displayCountry} Government Visa Portal
          </Link>
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-2">
          <h3 className="font-bold text-amber-900">Passport Requirements</h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Your passport MUST be valid for at least <strong>6 months</strong> beyond your intended date of entry, and have at least two blank pages. If you need a new passport, apply for it in your home country <strong>before</strong> starting the visa process.
          </p>
        </div>
      </div>
    </div>
  );
}
