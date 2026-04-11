'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

type GoogleLoginButtonProps = {
  onCredential: (credential: string) => Promise<void>;
};

export default function GoogleLoginButton({ onCredential }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onCredential);
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || !window.google) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        if (!credential) {
          return;
        }
        setLoading(true);
        try {
          await callbackRef.current(credential);
        } finally {
          setLoading(false);
        }
      },
    });

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: 320,
    });
  }, [clientId, scriptReady]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={buttonRef} className={loading ? 'opacity-70 pointer-events-none' : ''} />
      {loading ? <p className="text-xs text-gray-500">Signing in with Google…</p> : null}
    </div>
  );
}
