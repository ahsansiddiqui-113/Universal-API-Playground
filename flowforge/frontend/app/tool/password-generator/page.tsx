'use client';

import { useState, useCallback } from 'react';
import ToolShell from '@/components/tool/ToolShell';
import Breadcrumb from '@/components/tool/Breadcrumb';
import SchemaMarkup from '@/components/tool/SchemaMarkup';
import { getToolMetadata } from '@/lib/tool-metadata';

function generatePassword(length: number, options: {uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean}): string {
  const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  let available = '';
  if (options.uppercase) available += chars.uppercase;
  if (options.lowercase) available += chars.lowercase;
  if (options.numbers) available += chars.numbers;
  if (options.symbols) available += chars.symbols;

  let password = '';
  const cryptoArray = new Uint8Array(length);
  crypto.getRandomValues(cryptoArray);

  for (let i = 0; i < length; i++) {
    password += available[cryptoArray[i] % available.length];
  }

  return password;
}

function calculateStrength(password: string): string {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'Weak';
  if (strength <= 4) return 'Medium';
  return 'Strong';
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [passwords, setPasswords] = useState<string[]>([]);

  const run = useCallback(() => {
    const generated = Array.from({length: 5}, () => generatePassword(length, options));
    setPasswords(generated);
  }, [length, options]);

  const tool = getToolMetadata('password-generator');

  return (
    <>
      {tool && <SchemaMarkup tool={tool} />}
      <div className="max-w-screen-lg mx-auto px-6 py-6">
        <Breadcrumb items={[{ name: 'Password Generator' }]} />

        <ToolShell
          title="Secure Password Generator"
          description="Generate cryptographically secure passwords with customizable options."
          badge="NEW"
          inputLabel="Settings"
          outputLabel="Generated Passwords"
          inputSlot={
            <div className="space-y-4 p-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Length: {length}
                </label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={length}
                  onChange={e => setLength(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                {['uppercase', 'lowercase', 'numbers', 'symbols'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={options[opt as keyof typeof options]}
                      onChange={e => setOptions({...options, [opt]: e.target.checked})}
                      className="w-4 h-4"
                    />
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          }
          outputSlot={
            <div className="space-y-2 max-h-96 overflow-auto">
              {passwords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Click Generate to create passwords</p>
                </div>
              ) : (
                passwords.map((pwd, i) => {
                  const strength = calculateStrength(pwd);
                  const strengthColor = strength === 'Strong' ? 'text-emerald-400' : strength === 'Medium' ? 'text-amber-400' : 'text-red-400';

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 group"
                    >
                      <div>
                        <code className="text-xs font-mono text-gray-300 break-all">{pwd}</code>
                        <p className={`text-xs mt-1 ${strengthColor}`}>{strength}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(pwd)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-indigo-400 transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          }
          outputText={passwords.join('\n')}
          fileName="passwords.txt"
          singlePanel
          onClear={() => setPasswords([])}
          onRun={run}
          runLabel="Generate ↵"
        />
      </div>
    </>
  );
}
