'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#FF6B6B');
  const [colors, setColors] = useState<ColorFormats>({
    hex: '#FF6B6B',
    rgb: hexToRgb('#FF6B6B'),
    hsl: hexToHsl('#FF6B6B'),
  });

  const updateColor = useCallback((newHex: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(newHex)) return;
    setHex(newHex);
    setColors({
      hex: newHex,
      rgb: hexToRgb(newHex),
      hsl: hexToHsl(newHex),
    });
  }, []);

  const tool = getToolMetadata('color-converter');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'Color Converter' }]} />

        <ToolShell
          title="Color Converter"
          description="Convert colors between HEX, RGB, and HSL formats with visual picker."
          badge="NEW"
          inputLabel="Color Formats"
          outputLabel="Preview"
          inputSlot={
            <div className="space-y-4 p-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  HEX
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={hex}
                    onChange={e => updateColor(e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={hex}
                    onChange={e => updateColor(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  RGB
                </label>
                <input
                  type="text"
                  value={colors.rgb}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  HSL
                </label>
                <input
                  type="text"
                  value={colors.hsl}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm font-mono text-gray-300"
                />
              </div>
            </div>
          }
          outputSlot={
            <div className="space-y-4">
              <div
                className="w-full h-48 rounded-lg border-4 border-gray-800 shadow-lg"
                style={{backgroundColor: hex}}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">HEX</p>
                  <p className="font-mono text-gray-300">{colors.hex}</p>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">RGB</p>
                  <p className="font-mono text-gray-300 text-xs">{colors.rgb}</p>
                </div>
              </div>
            </div>
          }
          singlePanel
          runLabel="Convert ↵"
        />
      </div>
    </>
  );
}
