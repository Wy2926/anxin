import { useAppState } from '../store.tsx'
import { Icon } from '../components/Icon.tsx'

export function Messages() {
  const { state } = useAppState()
  return (
    <div className="g-page">
      <header className="g-head">
        <h2>消息中心</h2>
        <p className="g-sub">服药打卡 · 告警 · 系统通知</p>
      </header>
      <div className="card">
        {state.alerts.length === 0 && <div className="muted">暂无消息</div>}
        {state.alerts.map((a) => (
          <div className={`msg ${a.level}`} key={a.id}>
            <span className={`msg-ico ${a.level}`}>
              <Icon name={a.level === 'urgent' ? 'siren' : a.level === 'warn' ? 'bell' : 'check'} size={18} />
            </span>
            <div className="grow">
              <div className="msg-top">
                <strong>{a.title}</strong>
                <span className="muted xs">{a.time}</span>
              </div>
              <div className="muted sm">{a.detail}</div>
              {a.level === 'urgent' && (
                <div className="msg-actions">
                  <button className="btn danger" onClick={() => alert('正在回拨…（原型演示）')}>立即回拨</button>
                  <button className="btn ghost" onClick={() => alert('打开定位导航…（原型演示）')}>查看位置</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
