import { useAppState, type AuditScope } from '../store.tsx'
import { Icon, type IconName } from '../components/Icon.tsx'

const SCOPE_META: Record<AuditScope, { icon: IconName; label: string; cls: string }> = {
  screen: { icon: 'monitor', label: '看屏协助', cls: 'screen' },
  layout: { icon: 'wand', label: '远程编排', cls: 'layout' },
  location: { icon: 'mapPin', label: '定位', cls: 'location' },
  health: { icon: 'heart', label: '健康数据', cls: 'health' },
}

export function AuditLog({ onClose }: { onClose: () => void }) {
  const { active } = useAppState()

  return (
    <div className="g-app orch">
      <header className="orch-bar">
        <button className="orch-back" onClick={onClose} aria-label="返回">
          <Icon name="chevron" size={22} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="grow">
          <strong>隐私与审计 · {active.name}</strong>
          <div className="muted xs">敏感访问留痕 · {active.name}可见同一份</div>
        </div>
        <button className="orch-reset" onClick={() => alert('已导出审计记录（原型演示）')}>
          <Icon name="check" size={16} /> 导出
        </button>
      </header>

      <div className="g-body orch-body">
        <div className="card accent-card">
          <strong>关怀 &gt; 监控</strong>
          <p className="muted sm">看屏 / 定位 / 读取健康 / 推送布局等敏感操作全部留痕、不可篡改、双方可查，{active.name}可随时撤回任意授权。</p>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-h"><Icon name="shield" size={18} /> 访问记录（最新在前）</div>
          {active.audit.length === 0 && <div className="muted sm">暂无敏感访问记录。</div>}
          {active.audit.map((a) => {
            const meta = SCOPE_META[a.scope]
            return (
              <div className="list-row" key={a.id}>
                <span className={`audit-ico ${meta.cls}`}><Icon name={meta.icon} size={17} /></span>
                <div className="grow">
                  <strong>{a.action}</strong>
                  <div className="muted xs">{meta.label} · {a.detail}</div>
                </div>
                <span className="muted xs">{a.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
