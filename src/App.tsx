import { useState } from 'react'
import { GuardianApp } from './guardian/GuardianApp.tsx'
import { ElderApp } from './elder/ElderApp.tsx'

export function App() {
  const [single, setSingle] = useState<'both' | 'guardian' | 'elder'>('both')

  return (
    <div className="stage">
      <header className="stage-header">
        <div className="brand">
          <span className="brand-logo">安</span>
          <div>
            <h1>安心 · 守护家长</h1>
            <p>可点击原型 · P0 · 子女端 ↔ 父母端联动演示</p>
          </div>
        </div>
        <div className="stage-tabs">
          <button className={single === 'both' ? 'on' : ''} onClick={() => setSingle('both')}>双端并排</button>
          <button className={single === 'guardian' ? 'on' : ''} onClick={() => setSingle('guardian')}>子女端</button>
          <button className={single === 'elder' ? 'on' : ''} onClick={() => setSingle('elder')}>父母端</button>
        </div>
      </header>

      <main className={`devices ${single}`}>
        {single !== 'elder' && (
          <section className="device-col">
            <div className="device-label">子女端 · Guardian</div>
            <div className="phone phone-guardian">
              <GuardianApp />
            </div>
          </section>
        )}
        {single !== 'guardian' && (
          <section className="device-col">
            <div className="device-label">父母端 · Elder（适老）</div>
            <div className="phone phone-elder">
              <ElderApp />
            </div>
          </section>
        )}
      </main>

      <footer className="stage-footer">
        提示：在「子女端」发起看屏 → 「父母端」会弹出同意框；「父母端」吃药打卡 / SOS / 报平安 →「子女端」实时更新。
      </footer>
    </div>
  )
}
