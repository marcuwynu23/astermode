export default function App() {
  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              ✿
            </span>
            <span className="text-sm font-semibold tracking-wide text-slate-200">AsterMode</span>
          </div>
          <a
            className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
            href="#demo"
          >
            Open Demo
          </a>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Vite Plugin • React + TypeScript + Tailwind
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Beautiful Dev Overlay
                <span className="block text-emerald-300">For Faster UI Debugging</span>
              </h1>
              <p className="mt-5 max-w-xl text-slate-300">
                AsterMode injects a practical in-browser dev toolbar with hover inspection, storage tools,
                cache toggles, and live HTML editing.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <code className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300">
                  npm run dev
                </code>
                <span className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  Look bottom-left for the Aster icon
                </span>
              </div>
            </div>

            <div id="demo" className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30">
              <h2 className="text-lg font-semibold text-white">What to test</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="rounded-lg border border-white/10 bg-black/20 p-3">Drag the Aster trigger button.</li>
                <li className="rounded-lg border border-white/10 bg-black/20 p-3">Toggle hover border and inspect elements.</li>
                <li className="rounded-lg border border-white/10 bg-black/20 p-3">Right-click an element for live HTML editor.</li>
                <li className="rounded-lg border border-white/10 bg-black/20 p-3">Try storage, cookies, and cache controls.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
