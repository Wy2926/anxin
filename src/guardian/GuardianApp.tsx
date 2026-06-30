import { useState } from 'react'
import { Dashboard } from './Dashboard.tsx'
import { MedManager } from './MedManager.tsx'
import { Messages } from './Messages.tsx'
import { Orchestrator } from './Orchestrator.tsx'
import { AuditLog } from './AuditLog.tsx'
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
  const [auditing, setAuditing] = useState(false)
  const { state } = useAppState()
  const urgent = state.alerts.filter((a) => a.level === 'urgent').length

  if (orchestrating) return <Orchestrator onClose={() => setOrchestrating(false)} />
  if (auditing) return <AuditLog onClose={() => setAuditing(false)} />

  return (
    <div className="g-app">
      <div className="g-body">
        {(tab === 'home' || tab === 'guard') && <ElderSwitcher />}
        {tab === 'home' && <Dashboard />}
        {tab === 'guard' && <MedManager />}
        {tab === 'messages' && <Messages />}
        {tab === 'me' && <Me onOrchestrate={() => setOrchestrating(true)} onAudit={() => setAuditing(true)} />}
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

function ElderSwitcher() {
  const { state, active, dispatch } = useAppState()
  return (
    <div className="elder-switch">
      {state.elders.map((e) => {
        const hasUrgent = state.alerts.some((a) => a.elderId === e.id && a.level === 'urgent')
        return (
          <button
            key={e.id}
            className={`es-chip ${e.id === active.id ? 'on' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_ELDER', id: e.id })}
          >
            <span className="es-avatar">
              {e.avatar}
              {hasUrgent && <i className="es-alert" />}
            </span>
            <span className="es-name">{e.name}</span>
          </button>
        )
      })}
      <button className="es-add" onClick={() => alert('邀请新家人加入守护（原型演示）')}>
        <Icon name="plusCircle" size={22} />
        <span className="es-name">添加</span>
      </button>
    </div>
  )
}

function Me({ onOrchestrate, onAudit }: { onOrchestrate: () => void; onAudit: () => void }) {
  const { state, active } = useAppState()
  const enabledCount = active.elderLayout.tiles.filter((t) => t.enabled).length
  return (
    <div className="g-page">
      <header className="g-head">
        <h2>家庭</h2>
        <p className="g-sub">守护关系与隐私</p>
      </header>

      <button className="card orch-entry" onClick={onOrchestrate}>
        <span className="orch-entry-ico"><Icon name="wand" size={22} /></span>
        <div className="grow">
          <strong>编排{active.name}的手机界面</strong>
          <div className="muted xs">
            当前「{TEMPLATE_LABEL[active.elderLayout.template]}」· {enabledCount} 个入口 · 字号 {active.elderLayout.fontScale.toFixed(1)}×
          </div>
        </div>
        <Icon name="chevron" size={18} />
      </button>

      <div className="card">
        <div className="card-h"><Icon name="users" size={18} /> 我守护的家人（{state.elders.length}）</div>
        {state.elders.map((e) => (
          <div className="member-row mb" key={e.id}>
            <span className="avatar lg">{e.avatar}</span>
            <div className="grow">
              <strong>{e.name}</strong>
              <div className="muted sm">{e.relation} · {e.online ? '在线' : '离线'}</div>
            </div>
            <span className="chip solid">主守护</span>
          </div>
        ))}
        <button className="link-btn" onClick={() => alert('邀请新家人加入守护（原型演示）')}>
          <Icon name="plusCircle" size={16} /> 邀请其他家人共同守护
        </button>
      </div>

      <div className="card">
        <div className="card-h"><Icon name="shield" size={18} /> 权限与隐私</div>
        <PermRow label="查看状态 / 电量 / 步数" on />
        <PermRow label="语音 / 视频通话（需接听）" on />
        <PermRow label="远程看屏（单次授权）" on={false} note="默认关 · 每次需父母同意" />
        <PermRow label="实时定位" on={false} note="默认关" />
        <PermRow label="用药提醒管理" on />
        <button className="link-btn" onClick={onAudit}>
          <Icon name="shield" size={16} /> 查看隐私与审计日志（{active.audit.length}） <Icon name="chevron" size={14} />
        </button>
      </div>

      <button className="card accent-card audit-entry" onClick={onAudit}>
        <strong>隐私护栏</strong>
        <p className="muted sm">所有监督能力均为「邀请-同意 + 限时 + 留痕」，父母端可随时一键关闭。点击查看审计记录。关怀 &gt; 监控。</p>
      </button>
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
