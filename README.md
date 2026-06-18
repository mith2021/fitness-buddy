# Verdict

Daily nutrition coaching app. Real feedback, no fluff.

## Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind v4 + CSS Vars
- **Components:** shadcn/ui (minimal)
- **Animations:** Framer Motion (minimal)
- **State:** React Context + hooks
- **Backend:** Supabase (PostgreSQL + Auth)
- **LLM:** OpenRouter API (Claude Sonnet 4.6)
- **Deployment:** Vercel

## Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase URL and anon key
3. Add your OpenRouter API key
4. `npm install` (already done)
5. `npm run dev`

## Development

- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run preview` — preview build locally

## Day 1 Progress

✅ Vite scaffold
✅ Tailwind v4 setup
✅ Supabase client config
✅ Auth hook (login/signup/logout)
✅ LoginForm component
✅ Basic layout (Header, Navigation)
✅ Card, Button, Input components

Next: Food form + daily total (Day 2-3)
