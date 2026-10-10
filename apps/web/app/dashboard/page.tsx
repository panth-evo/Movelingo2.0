export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to your MoveLingo plan.</h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto">Your placement test is complete and your personalized language engine is ready to go.</p>
      </div>
    </div>
  );
}
