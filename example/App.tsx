import React, { useState, useEffect } from 'react';
import {
  NairaRampProvider,
  RampWidget,
  ConversionCalculator,
  Transaction,
} from '@nairaramp/sdk-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_ANCHOR = 'flutterwave.com';
const GITHUB_URL = 'https://github.com/nairaramp/sdk-react';
const NPM_URL = 'https://www.npmjs.com/package/@nairaramp/sdk-react';
const DOCS_URL = 'https://docs.nairaramp.io';

const INSTALL_CODE = `npm install @nairaramp/sdk-react`;

const USAGE_CODE = `import { NairaRampProvider, RampWidget } from '@nairaramp/sdk-react';

function App() {
  return (
    <NairaRampProvider apiKey="pk_live_...">
      <RampWidget
        type="deposit"
        onSuccess={(tx) => console.log('Done!', tx)}
        onError={(err) => console.error(err)}
      />
    </NairaRampProvider>
  );
}`;

const FEATURES = [
  {
    icon: '⚡',
    title: 'Near-Instant Settlement',
    desc: 'Stellar Network finalizes transactions in 3–5 seconds — not hours.',
    color: '#fbbf24',
    bg: '#fffbeb',
  },
  {
    icon: '💸',
    title: 'Sub-Cent Fees',
    desc: 'Pay fractions of a cent per transaction. No hidden charges, ever.',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    icon: '🔌',
    title: '3-Line Integration',
    desc: 'Provider + Widget. That\'s all it takes to go live in your app.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: '🔐',
    title: 'SEP-24 & SEP-6',
    desc: 'Full support for both interactive KYC flows and direct transfers.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: '📡',
    title: 'Real-Time Rates',
    desc: 'Live NGN/USDC rates from multiple anchors with auto-refresh.',
    color: '#06b6d4',
    bg: '#ecfeff',
  },
  {
    icon: '🌍',
    title: 'African-First',
    desc: 'Built for Nigeria. Expanding to GHS, KES, ZAR, and beyond.',
    color: '#f97316',
    bg: '#fff7ed',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Install the SDK',
    desc: 'One npm command. Zero configuration needed to get started.',
    code: 'npm install @nairaramp/sdk-react',
  },
  {
    num: '02',
    title: 'Wrap your app',
    desc: 'Add the NairaRampProvider with your API key at the root.',
    code: '<NairaRampProvider apiKey="pk_live_...">',
  },
  {
    num: '03',
    title: 'Drop in the widget',
    desc: 'Place RampWidget anywhere. Deposits and withdrawals ready.',
    code: '<RampWidget type="deposit" onSuccess={fn} />',
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export function App() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal'>('deposit');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copyInstall = () => {
    navigator.clipboard.writeText(INSTALL_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <NairaRampProvider apiKey={import.meta.env.VITE_NAIRARAMP_API_KEY || 'pk_test_demo'}>
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>

        {/* ── Navbar ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(10,15,30,0.97)' : '#0a0f1e',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
                N
              </div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
                NairaRamp
              </span>
              <span style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: '0.05em', border: '1px solid rgba(34,197,94,0.3)' }}>
                BETA
              </span>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <NavLink href={DOCS_URL} label="Docs" />
              <NavLink href={GITHUB_URL} label="GitHub" />
              <NavLink href={NPM_URL} label="npm" />
              <a
                href={DOCS_URL}
                style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s' }}
              >
                Get API Key
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1a3a 60%, #0a1628 100%)', padding: '80px 24px 100px', position: 'relative', overflow: 'hidden' }}>
          {/* Background orbs */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 440px', gap: 64, alignItems: 'center' }}>

            {/* Left: Copy */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                Built on Stellar Network
              </div>

              <h1 style={{ color: '#fff', fontSize: 52, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
                NGN ↔ USDC{' '}
                <span style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  On/Off Ramps
                </span>
                <br />for Nigerian Apps
              </h1>

              <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Open-source React SDK. Drop in one widget. Give your users fast, cheap, and compliant Naira-to-USDC transfers — powered by Stellar.
              </p>

              {/* Install command */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 340 }}>
                  <span style={{ color: '#4ade80', fontFamily: 'monospace', fontSize: 13 }}>$</span>
                  <code style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: 14 }}>{INSTALL_CODE}</code>
                </div>
                <button
                  onClick={copyInstall}
                  style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: copied ? '#4ade80' : '#94a3b8', padding: '12px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { icon: '⚡', label: '3–5s settlement' },
                  { icon: '💸', label: 'Sub-cent fees' },
                  { icon: '🔓', label: 'MIT License' },
                  { icon: '📦', label: 'TypeScript' },
                ].map((b) => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '6px 12px', borderRadius: 8, fontSize: 13 }}>
                    <span>{b.icon}</span> {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Widget */}
            <div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 8 }}>
                {/* Tab switcher */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, marginBottom: 8 }}>
                  {(['deposit', 'withdrawal'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      style={{
                        flex: 1, padding: '10px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                        background: activeTab === t ? '#2563eb' : 'transparent',
                        color: activeTab === t ? '#fff' : '#94a3b8',
                      }}
                    >
                      {t === 'deposit' ? '↓ Deposit NGN' : '↑ Withdraw NGN'}
                    </button>
                  ))}
                </div>

                <RampWidget
                  type={activeTab}
                  theme="light"
                  showAnchorSelection
                  minAmount={100}
                  onSuccess={(tx) => setLastTx(tx)}
                  onError={(e) => console.error(e)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48 }}>
            {[
              { label: 'Settlement time', value: '3–5 seconds' },
              { label: 'Average fee', value: '< $0.01' },
              { label: 'Protocol', value: 'SEP-24 & SEP-6' },
              { label: 'Network', value: 'Stellar Mainnet' },
              { label: 'License', value: 'MIT Open Source' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div style={{ width: 1, height: 24, background: '#1e293b' }} />}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: '#475569', fontSize: 11, marginTop: 1 }}>{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Live Converter ── */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <SectionBadge>Live Conversion</SectionBadge>
              <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '12px 0 16px', lineHeight: 1.2 }}>
                Real-time NGN/USDC rates from the best anchors
              </h2>
              <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.7, marginBottom: 24 }}>
                NairaRamp discovers available Stellar anchors and fetches live exchange rates. Users always get the best deal — automatically.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Compares rates across multiple anchors', 'Auto-refreshes every 30 seconds', 'Bi-directional NGN ↔ USDC conversion', 'Zero API key needed for rates'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155', fontSize: 15 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <ConversionCalculator anchorDomain={DEMO_ANCHOR} defaultAmount={50000} theme="light" />
            </div>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <SectionBadge>Why NairaRamp</SectionBadge>
              <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '12px 0 16px' }}>
                Everything you need, nothing you don't
              </h2>
              <p style={{ color: '#64748b', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
                A focused SDK with exactly the primitives Nigerian fintech apps need — no bloat, no lock-in.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{ background: '#f8fafc', borderRadius: 14, padding: 28, border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s', cursor: 'default' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge>Quick Start</SectionBadge>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '12px 0 16px' }}>
              Live in 3 steps
            </h2>
            <p style={{ color: '#64748b', fontSize: 17, maxWidth: 440, margin: '0 auto' }}>
              From zero to a fully functional ramp widget in under 5 minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {STEPS.map((s) => (
              <div key={s.num} style={{ position: 'relative' }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#e2e8f0', marginBottom: 16, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>{s.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                <div style={{ background: '#0f172a', borderRadius: 10, padding: '12px 16px' }}>
                  <code style={{ color: '#4ade80', fontFamily: 'monospace', fontSize: 13 }}>{s.code}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Code Block ── */}
        <section style={{ background: '#0f172a', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <div>
                <SectionBadge dark>Integration</SectionBadge>
                <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', color: '#f1f5f9', margin: '12px 0 16px', lineHeight: 1.2 }}>
                  Clean API, full TypeScript support
                </h2>
                <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
                  Every prop, hook, and utility is fully typed. Your IDE auto-completes everything. No guessing.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Zero-config anchor discovery', 'Tree-shakeable ES modules', 'React 18 + StrictMode compatible', 'Works with Next.js, Vite, CRA'].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 15 }}>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>→</span> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ background: '#020617', borderRadius: 16, border: '1px solid #1e293b', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ marginLeft: 8, color: '#475569', fontSize: 12 }}>App.tsx</span>
                  </div>
                  <pre style={{ padding: 24, margin: 0, fontSize: 13, lineHeight: 1.8, overflow: 'auto' }}>
                    <CodeHighlight code={USAGE_CODE} />
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Last Transaction Receipt ── */}
        {lastTx && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, maxWidth: 320 }}>
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Transaction Initiated</div>
                <button onClick={() => setLastTx(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <div style={{ padding: 18 }}>
                {[
                  { label: 'Type', value: lastTx.type.charAt(0).toUpperCase() + lastTx.type.slice(1) },
                  { label: 'Amount', value: `₦${lastTx.amount.toLocaleString()}` },
                  { label: 'Status', value: lastTx.status.toUpperCase() },
                  { label: 'Anchor', value: lastTx.anchorDomain || '—' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: '6px 0', fontSize: 11, color: '#94a3b8', wordBreak: 'break-all' }}>
                  ID: {lastTx.id}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer style={{ background: '#020617', padding: '60px 24px 40px', borderTop: '1px solid #0f172a' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>N</div>
                  <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>NairaRamp</span>
                </div>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                  Open-source NGN ↔ USDC SDK for Nigerian developers. Built on Stellar. MIT Licensed.
                </p>
              </div>

              {/* Links */}
              {[
                { heading: 'Product', links: ['Documentation', 'npm Package', 'Changelog', 'Roadmap'] },
                { heading: 'Community', links: ['GitHub', 'Discord', 'Twitter', 'Issues'] },
                { heading: 'Legal', links: ['MIT License', 'Privacy Policy', 'Terms of Use'] },
              ].map((col) => (
                <div key={col.heading}>
                  <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>{col.heading}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.links.map((l) => (
                      <li key={l}><a href="#" style={{ color: '#475569', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#94a3b8'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#475569'; }}>{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #0f172a', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: '#334155', fontSize: 13 }}>
                © 2026 NairaRamp. Built with ❤ for the African fintech ecosystem.
              </p>
              <p style={{ color: '#334155', fontSize: 13 }}>
                Powered by{' '}
                <a href="https://stellar.org" style={{ color: '#3b82f6', textDecoration: 'none' }}>Stellar Network</a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </NairaRampProvider>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#fff'; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#94a3b8'; }}
    >
      {label}
    </a>
  );
}

function SectionBadge({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff', border: `1px solid ${dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe'}`, color: dark ? '#93c5fd' : '#1d4ed8', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function CodeHighlight({ code }: { code: string }) {
  const keywords = ['import', 'from', 'function', 'return', 'const', 'export'];
  const components = ['NairaRampProvider', 'RampWidget'];
  const strings = /(["'`])(?:(?!\1).)*\1/g;

  const lines = code.split('\n').map((line, li) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    // Simple tokenizer — not a full parser, just good enough for the demo
    const segments = remaining.split(/(\s+|[<>/{}(),=])/);
    const rendered = segments.map((seg, si) => {
      if (keywords.includes(seg)) return <span key={si} style={{ color: '#c084fc' }}>{seg}</span>;
      if (components.includes(seg)) return <span key={si} style={{ color: '#67e8f9' }}>{seg}</span>;
      if (/^['"]/.test(seg)) return <span key={si} style={{ color: '#86efac' }}>{seg}</span>;
      if (/^[A-Z]/.test(seg) && seg.length > 1) return <span key={si} style={{ color: '#fde68a' }}>{seg}</span>;
      if (['<', '>', '/>', '/>'].includes(seg)) return <span key={si} style={{ color: '#f472b6' }}>{seg}</span>;
      return <span key={si} style={{ color: '#94a3b8' }}>{seg}</span>;
    });

    return <div key={li}>{rendered}</div>;
  });

  return <>{lines}</>;
}

export default App;
