import { useState } from 'react'
import { Dashboard } from './Dashboard.tsx'
import { MedManager } from './MedManager.tsx'
import { Messages } from './Messages.tsx'
import { Orchestrator } from './Orchestrator.tsx'
import { useAppState, TEMPLATE_LABEL } from '../store.tsx'
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
  const [orchestrating, setOrchestrating] = useState(false)
  const { state } = useAppState()
  const urgent = state.alerts.filter((a) => a.level === 'urgent').length

  if (orchestrating) return <Orchestrator onClose={() => setOrchestrating(false)} />

  return (
    <div className="g-app">
      <div className="g-body">
        {tab === 'home' && <Dashboard />}
        {tab === 'guard' && <MedManager />}
        {tab === 'messages' && <Messages />}
        {tab === 'me' && <Me onOrchestrate={() => setOrchestrating(true)} />}
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

function Me({ onOrchestrate }: { onOrchestrate: () => void }) {
  const { state } = useAppState()
  const enabledCount = state.elderLayout.tiles.filter((t) => t.enabled).length
  return (
    <div className="g-page">
      <header className="g-head">
        <h2>家庭</h2>
        <p className="g-sub">守护关系与隐私</p>
      </header>

      <button className="card orch-entry" onClick={onOrchestrate}>
        <span className="orch-entry-ico"><Icon name="wand" size={22} /></span>
        <div className="grow">
          <strong>编排{state.elderName}的手机界面</strong>
          <div className="muted xs">
            当前「{TEMPLATE_LABEL[state.elderLayout.template]}」· {enabledCount} 个入口 · 字号 {state.elderLayout.fontScale.toFixed(1)}×
          </div>
        </div>
        <Icon name="chevron" size={18} />
      </button>

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
