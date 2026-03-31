import Link from 'next/link';

const features = [
  {
    icon: '↘',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Input Node',
    desc: 'Declare the fields your workflow accepts. Validates required data before execution starts.',
  },
  {
    icon: '⚡',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'API Node',
    desc: 'Call any HTTP endpoint. Use {{field}} or {{nodeId.field}} to inject dynamic values into URLs and bodies.',
  },
  {
    icon: '⚙',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Transform Node',
    desc: 'Reshape data with 11 built-in methods — pick, omit, extractField, merge, filterArray and more.',
  },
  {
    icon: '↗',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Output Node',
    desc: 'Format and return the final result as JSON or plain text.',
  },
];

const steps = [
  { n: '1', title: 'Create a workflow', desc: 'Give it a name and open the editor.' },
  { n: '2', title: 'Add & connect nodes', desc: 'Drag from the palette, then wire nodes together.' },
  { n: '3', title: 'Configure each node', desc: 'Set URLs, transforms and output format in the properties panel.' },
  { n: '4', title: 'Run it', desc: 'Hit ▶ Run, supply JSON input and see per-node results instantly.' },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Visual API Workflow Builder
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Build workflows.</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Ship faster.</span>
        </h1>
        <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
          Chain HTTP requests, transform data and automate anything — no code required.
          Connect nodes visually and execute in seconds.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/workflows"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Open Workflows →
          </Link>
          <a
            href="#how-it-works"
            className="text-gray-400 hover:text-white text-sm px-4 py-2.5 rounded-lg border border-white/5 hover:border-white/10 transition-all"
          >
            How it works
          </a>
        </div>
      </section>

      {/* Node types */}
      <section className="px-6 pb-20 max-w-screen-lg mx-auto w-full">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center mb-8">
          Four node types. Infinite possibilities.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className={`rounded-xl border p-5 ${f.bg} flex flex-col gap-3`}>
              <span className={`text-2xl ${f.color}`}>{f.icon}</span>
              <div>
                <p className="font-semibold text-white text-sm">{f.title}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/5 px-6 py-20 max-w-screen-lg mx-auto w-full">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(s => (
            <div key={s.n} className="flex flex-col gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold flex items-center justify-center">
                {s.n}
              </span>
              <p className="font-semibold text-white text-sm">{s.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
