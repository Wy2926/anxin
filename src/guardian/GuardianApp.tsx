import { useState } from 'react'
import { Dashboard } from './Dashboard.tsx'
import { MedManager } from './MedManager.tsx'
import { Messages } from './Messages.tsx'
import { useAppState } from '../store.tsx'
import { Icon, type IconName } from '../components/Icon.tsx'

type Tab = 'home' | 'guard' | 'messages' | 'me'

const tabs: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'guard', label: '守护', icon: 'pill' },
  { key: 'messages', label: '消息', icon: 'bell' },
  { key: 'me', label: '我的', icon: 'user' },
]

export function GuardianApp() {
  const [tab, setTab] = useState<Tab>('home')
  const { state } = useAppState()
  const urgent = state.alerts.filter((a) => a.level === 'urgent').length

  return (
    <div className="g-app">
      <div className="g-body">
        {tab === 'home' && <Dashboard />}
        {tab === 'guard' && <MedManager />}
        {tab === 'messages' && <Messages />}
        {tab === 'me' && <Me />}
      </div>

      <nav className="g-tabbar">
        {tabs.map((t) => (
          <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            <span className="tab-ico">
              <Icon name={t.icon} size={24} />
              {t.key === 'messages' && urgent > 0 && <i className="badge">{urgent}</i>}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function Me() {
  const { state } = useAppState()
  return (
    <div className="g-page">
      <header className="g-head">
        <h2>家庭</h2>
        <p className="g-sub">守护关系与隐私</p>
      </header>

      <div className="card">
        <div className="member-row">
          <span className="avatar lg">👴</span>
          <div className="grow">
            <strong>{state.elderName}</strong>
            <div className="muted sm">被守护者 · {state.online ? '在线' : '离线'}</div>
          </div>
          <span className="chip solid">主守护</span>
        </div>
        <div className="divider" />
        <div className="member-row">
          <span className="avatar lg">🧑</span>
          <div className="grow">
            <strong>{state.guardianName}（我）</strong>
            <div className="muted sm">守护者</div>
          </div>
          <span className="chip">协同</span>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <Icon name="shield" size={18} /> 权限与隐私
        </div>
        <PermRow label="查看状态 / 电量 / 步数" on />
        <PermRow label="语音 / 视频通话（需接听）" on />
        <PermRow label="远程看屏（单次授权）" on={false} note="默认关 · 每次需父母同意" />
        <PermRow label="实时定位" on={false} note="默认关" />
        <PermRow label="用药提醒管理" on />
      </div>

      <div className="card accent-card">
        <strong>隐私护栏</strong>
        <p className="muted sm">所有监督能力均为「邀请-同意 + 限时 + 留痕」，父母端可随时一键关闭。关怀 &gt; 监控。</p>
      </div>
    </div>
  )
}

function PermRow({ label, on, note }: { label: string; on: boolean; note?: string }) {
  return (
    <div className="perm-row">
      <div className="grow">
        <div>{label}</div>
        {note && <div className="muted xs">{note}</div>}
      </div>
      <span className={`toggle ${on ? 'on' : ''}`} role="switch" aria-checked={on}>
        <i />
      </span>
    </div>
  )
}
