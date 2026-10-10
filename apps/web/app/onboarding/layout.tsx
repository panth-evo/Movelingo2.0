import { OnboardingProvider } from './OnboardingContext';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <div className="max-w-3xl mx-auto w-full pt-8 pb-16">
        {children}
      </div>
    </OnboardingProvider>
  );
}
