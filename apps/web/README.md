# MoveLingo: Web Frontend

MoveLingo is the premiere relocation planner and language-learning engine. This Next.js 14 application is the main entry point for users aiming to build their move plan, track their visa-required language level, and conquer practice exams.

## Quick Start

1. **Install Dependencies**
   ```bash
   cd apps/web
   npm install
   ```

2. **Configure Environment**
   By default, the app is configured to point to the live Python FastAPI backend via `.env.local`. 
   If you want to run completely offline without the backend, enable Fixtures mode:
   ```bash
   # In apps/web/.env.local
   NEXT_PUBLIC_USE_FIXTURES=1
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## The "Six-Click Demo"

To explore the entire MoveLingo flow in less than two minutes, follow this script:

1. **Start**: Navigate to `/` and click the main CTA to start your relocation plan.
2. **Onboard**: Complete the quick 7-step profile builder (Personal, Work, Finance, etc.).
3. **Placement**: Sit the simulated placement test on Step 8 and submit it to establish your baseline CEFR level.
4. **Dashboard**: Arrive at `/dashboard`. Marvel at the six populated panels, specifically the animated `Language Tracker` showing the gap between your current level and the visa requirement.
5. **Practice Picker**: Navigate to `/exams` and click **"One Part Drill"** on any available mock exam.
6. **Execution**: Sit the strict, un-pausable mock exam. If it's a Speaking task, hit "Start Recording" to see the live Web Speech API transcript. Submit early to witness the pass/fail result grading!

## Tech Stack
- Next.js 14 App Router
- React 18
- Tailwind CSS
- Framer Motion (Animations)
- Lucide React (Icons)
- Web Speech API (TTS & STT)
