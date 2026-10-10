import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoveLingo',
  description: 'Relocation planner plus language-learning engine.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">MoveLingo</Link>
              <div className="hidden sm:flex gap-6 text-sm font-medium text-slate-600">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link href="/learn/skill-map" className="hover:text-blue-600 transition-colors">Learn</Link>
                <Link href="/exams" className="hover:text-blue-600 transition-colors">Exams</Link>
                <Link href="/tools/timeline" className="hover:text-blue-600 transition-colors">Timeline</Link>
                <Link href="/tools/compare" className="hover:text-blue-600 transition-colors">Compare</Link>
                <Link href="/admin" className="hover:text-red-600 font-bold transition-colors">Admin</Link>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
        
        <footer className="bg-slate-100 border-t border-slate-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
            <p>Not legal advice. Check the official government site for the most up-to-date visa information.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
