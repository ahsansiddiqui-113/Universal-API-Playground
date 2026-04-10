'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool/ToolShell';

const PLATFORMS = [
  { name: 'YouTube', pattern: /youtube\.com|youtu\.be/, color: 'text-red-400' },
  { name: 'Instagram', pattern: /instagram\.com/, color: 'text-pink-400' },
  { name: 'TikTok', pattern: /tiktok\.com/, color: 'text-cyan-400' },
  { name: 'Twitter/X', pattern: /twitter\.com|x\.com/, color: 'text-sky-400' },
  { name: 'Facebook', pattern: /facebook\.com|fb\.watch/, color: 'text-blue-400' },
  { name: 'Vimeo', pattern: /vimeo\.com/, color: 'text-teal-400' },
];

export default function VideoDownloaderPage() {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const detected = PLATFORMS.find(p => p.pattern.test(url));

  async function download() {
    if (!url.trim()) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/tools/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, filename: filename || 'video' }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Download failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${filename || 'video'}.mp4`;
      a.click();
      setSuccess('Download started!');
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  const inputSlot = (
    <div className="p-6 space-y-5">
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-400 leading-relaxed">
        <strong>Legal use only.</strong> Only download content you own or have permission to download. Respect copyright and platform terms of service.
      </div>
      <div>
        <p className="text-[11px] text-gray-500 font-mono mb-1.5">Video URL</p>
        <div className="relative">
          <input value={url} onChange={e => { setUrl(e.target.value); setError(''); setSuccess(''); }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full h-11 px-4 pr-24 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm font-mono outline-none focus:border-indigo-500 transition-colors" />
          {detected && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${detected.color}`}>
              {detected.name}
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="text-[11px] text-gray-500 font-mono mb-1.5">File name (optional)</p>
        <input value={filename} onChange={e => setFilename(e.target.value)} placeholder="my-video"
          className="w-full h-9 px-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono outline-none focus:border-indigo-500" />
      </div>
      <div>
        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-3">Supported platforms</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <span key={p.name} className={`text-xs font-mono px-2 py-1 rounded-md bg-gray-800/60 border border-gray-700/40 ${p.color}`}>{p.name}</span>
          ))}
        </div>
      </div>
      {error && <div className="bg-red-950/50 border border-red-800 rounded-xl p-3 text-xs text-red-400">{error}</div>}
      {success && <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-3 text-xs text-emerald-400">{success}</div>}
    </div>
  );

  const outputSlot = (
    <div className="flex items-center justify-center h-full text-gray-700 text-sm font-mono p-6 text-center">
      Enter a URL and click Download.<br />The file will save directly to your downloads folder.
    </div>
  );

  return (
    <ToolShell title="Video Link Downloader" description="Download videos for legal personal use. Supports YouTube, Instagram, TikTok and more."
      inputLabel="Configuration" outputLabel="Info"
      inputSlot={inputSlot} outputSlot={outputSlot}
      onClear={() => { setUrl(''); setFilename(''); setError(''); setSuccess(''); }}
      onRun={download} runLabel={loading ? 'Downloading…' : 'Download ↓'} running={loading} />
  );
}