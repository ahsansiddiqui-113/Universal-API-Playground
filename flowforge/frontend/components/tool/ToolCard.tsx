import Link from 'next/link';

interface ToolCardProps {
    href: string;
    title: string;
    description: string;
    features: string[];
    badge?: string;
    phase?: 1 | 2 | 3;
    category?: 'developer' | 'ai' | 'utility';
}

const badgeStyles: Record<string, string> = {
    NEW: 'bg-emerald-900/40 border-emerald-700 text-emerald-400',
    AI: 'bg-purple-900/40 border-purple-700 text-purple-300',
};

const categoryAccent: Record<string, string> = {
    developer: 'group-hover:border-indigo-500/40',
    ai: 'group-hover:border-purple-500/40',
    utility: 'group-hover:border-amber-500/40',
};

const arrowColor: Record<string, string> = {
    developer: 'text-indigo-500',
    ai: 'text-purple-500',
    utility: 'text-amber-500',
};

export default function ToolCard({
    href,
    title,
    description,
    features,
    badge,
    phase,
    category = 'developer',
}: ToolCardProps) {
    return (
        <Link
            href={href}
            className={`group relative flex flex-col bg-gray-900 border border-gray-800
                  rounded-xl p-5 transition-all duration-200 cursor-pointer
                  hover:bg-gray-800/80 ${categoryAccent[category]}`}
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-white leading-snug">
                    {title}
                </h3>
                {badge && (
                    <span className={`text-[9px] font-semibold tracking-widest uppercase
                            border px-2 py-0.5 rounded-full flex-shrink-0
                            ${badgeStyles[badge] ?? 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                        {badge}
                    </span>
                )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
                {description}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-1.5">
                {features.slice(0, 4).map((f) => (
                    <span
                        key={f}
                        className="text-[10px] font-mono text-gray-500 bg-gray-800
                       border border-gray-700/60 rounded-md px-2 py-0.5"
                    >
                        {f}
                    </span>
                ))}
            </div>

            {/* Hover arrow */}
            <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
                       transition-all duration-200 translate-x-0 group-hover:translate-x-1
                       ${arrowColor[category]}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </Link>
    );
}