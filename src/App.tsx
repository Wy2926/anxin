import { useState } from 'react'
import { GuardianApp } from './guardian/GuardianApp.tsx'
import { ElderApp } from './elder/ElderApp.tsx'

type View = 'both' | 'guardian' | 'elder'

export function App() {
  const [view, setView] = useState<View>('both')

  return (
    <div className="stage">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo">安</span>
          <div className="brand-text">
            <h1>安心 · 守护家长</h1>
            <p>可点击原型 · 子女端 ↔ 父母端联动</p>
          </div>
        </div>
        <div className="segmented" role="tablist">
          {(['both', 'guardian', 'elder'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              className={view === v ? 'on' : ''}
              onClick={() => setView(v)}
            >
              {v === 'both' ? '双端' : v === 'guardian' ? '子女端' : '父母端'}
            </button>
          ))}
        </div>
      </header>

      <main className={`devices ${view}`}>
        {view !== 'elder' && (
          <section className="device-col">
            <div className="device-label">子女端 · Guardian</div>
            <DeviceFrame variant="guardian">
              <GuardianApp />
            </DeviceFrame>
          </section>
        )}
        {view !== 'guardian' && (
          <section className="device-col">
            <div className="device-label">父母端 · Elder（适老）</div>
            <DeviceFrame variant="elder">
              <ElderApp />
            </DeviceFrame>
          </section>
        )}
      </main>

      <footer className="stage-footer">
        子女端「发起看屏」→ 父母端弹出同意；父母端 吃药打卡 / SOS / 报平安 → 子女端实时更新。
      </footer>
    </div>
  )
}

function DeviceFrame({
  variant,
  children,
}: {
  variant: 'guardian' | 'elder'
  children: React.ReactNode
}) {
  return (
    <div className={`device ${variant}`}>
      <div className="device-island" />
      <div className="device-screen">{children}</div>
    </div>
  )
}
