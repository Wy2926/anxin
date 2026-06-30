import { useState } from 'react'
import { Dashboard } from './Dashboard.tsx'
import { MedManager } from './MedManager.tsx'
import { Messages } from './Messages.tsx'
import { useAppState } from '../store.tsx'

type Tab = 'home' | 'guard' | 'messages' | 'me'

export function GuardianApp() {
  const [tab, setTab] = useState<Tab>('home')
  const { state } = useAppState()
  const urgent = state.alerts.filter((a) => a.level === 'urgent').length

  return (
    <div className="g-app">
      <div className="g-statusbar">
        <span>9:41</span>
        <span>安心守护</span>
        <span>📶 🔋</span>
      </div>

      <div className="g-body">
        {tab === 'home' && <Dashboard />}
        {tab === 'guard' && <MedManager />}
        {tab === 'messages' && <Messages />}
        {tab === 'me' && <Me />}
      </div>

      <nav className="g-tabbar">
        <button className={tab === 'home' ? 'on' : ''} onClick={() => setTab('home')}>
          <span>🏠</span>首页
        </button>
        <button className={tab === 'guard' ? 'on' : ''} onClick={() => setTab('guard')}>
          <span>💊</span>守护
        </button>
        <button className={tab === 'messages' ? 'on' : ''} onClick={() => setTab('messages')}>
          <span className="ico-wrap">📨{urgent > 0 && <i className="badge">{urgent}</i>}</span>消息
        </button>
        <button className={tab === 'me' ? 'on' : ''} onClick={() => setTab('me')}>
          <span>👤</span>我的
        </button>
      </nav>
    </div>
  )
}

function Me() {
  const { state } = useAppState()
  return (
    <div className="g-page">
      <h2 className="g-title">我的 · 家庭</h2>
      <div className="card">
        <div className="row between">
          <div className="member">
            <span className="avatar">👴</span>
            <div>
              <strong>{state.elderName}</strong>
              <div className="muted">被守护者 · {state.online ? '在线' : '离线'}</div>
            </div>
          </div>
          <span className="pill">主守护</span>
        </div>
        <div className="row between">
          <div className="member">
            <span className="avatar">🧑</span>
            <div>
              <strong>{state.guardianName}（我）</strong>
              <div className="muted">守护者</div>
            </div>
          </div>
          <span className="pill ghost">协同</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-h">权限与隐私</h3>
        <PermRow label="查看状态 / 电量 / 步数" on />
        <PermRow label="语音 / 视频通话（需接听）" on />
        <PermRow label="远程看屏（单次授权）" on={false} note="默认关 · 每次需父母同意" />
        <PermRow label="实时定位" on={false} note="默认关" />
        <PermRow label="用药提醒管理" on />
      </div>

      <div className="card note-card">
        <strong>隐私护栏</strong>
        <p className="muted">所有监督能力均为「邀请-同意 + 限时 + 留痕」，父母端可随时一键关闭。关怀 &gt; 监控。</p>
      </div>
    </div>
  )
}

function PermRow({ label, on, note }: { label: string; on: boolean; note?: string }) {
  return (
    <div className="row between perm">
      <div>
        <div>{label}</div>
        {note && <div className="muted tiny">{note}</div>}
      </div>
      <span className={`switch ${on ? 'on' : ''}`}>{on ? '开' : '关'}</span>
    </div>
  )
}
