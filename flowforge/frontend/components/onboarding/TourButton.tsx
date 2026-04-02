'use client';

export default function TourButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('flowforge:open-tour'))}
      className="text-xs text-gray-500 hover:text-gray-200 hover:bg-white/5 px-2.5 py-1.5 rounded-md transition-all border border-transparent hover:border-white/5 flex items-center gap-1.5"
      title="Open quick tour"
    >
      <span className="text-sm leading-none">?</span>
      <span className="hidden sm:inline">Tour</span>
    </button>
  );
}
