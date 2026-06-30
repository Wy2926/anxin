import { useAppState } from '../store.tsx'

export function Messages() {
  const { state } = useAppState()
  return (
    <div className="g-page">
      <h2 className="g-title">消息中心</h2>
      <div className="card">
        {state.alerts.length === 0 && <div className="muted">暂无消息</div>}
        {state.alerts.map((a) => (
          <div className={`msg ${a.level}`} key={a.id}>
            <span className="msg-dot" />
            <div className="msg-body">
              <div className="row between">
                <strong>{a.title}</strong>
                <span className="muted tiny">{a.time}</span>
              </div>
              <div className="muted">{a.detail}</div>
              {a.level === 'urgent' && (
                <div className="msg-actions">
                  <button className="btn danger" onClick={() => alert('正在回拨…（原型演示）')}>立即回拨</button>
                  <button className="btn" onClick={() => alert('打开定位导航…（原型演示）')}>查看位置</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
