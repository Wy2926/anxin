import { useAppState } from '../store.tsx'

const medLabel: Record<string, string> = {
  taken: '已服用',
  pending: '待提醒',
  due: '待服用',
  missed: '已超时',
}

export function Dashboard() {
  const { state, dispatch } = useAppState()
  const dueMed = state.meds.find((m) => m.status === 'due' || m.status === 'missed')

  return (
    <div className="g-page">
      <h2 className="g-title">早上好，给{state.elderName}打个招呼吧</h2>

      <div className="card status-card">
        <div className="row between">
          <div className="member">
            <span className="avatar big">👴</span>
            <div>
              <strong>{state.elderName}</strong>
              <div className={`status ${state.online ? 'ok' : 'off'}`}>
                {state.online ? '一切正常 🟢' : '离线'}
              </div>
            </div>
          </div>
          <div className="metrics">
            <div>🔋 {state.battery}%</div>
            <div>👣 {state.steps.toLocaleString()}</div>
          </div>
        </div>
        <div className="quick-actions">
          <button className="qa" onClick={() => alert('正在呼叫：语音通话（原型演示）')}>📞 语音</button>
          <button className="qa" onClick={() => alert('正在呼叫：视频通话（原型演示）')}>📹 视频</button>
          <button
            className="qa primary"
            disabled={state.screenAssist !== 'idle'}
            onClick={() => dispatch({ type: 'REQUEST_SCREEN_ASSIST' })}
          >
            🖥️ {state.screenAssist === 'idle' ? '发起看屏' : state.screenAssist === 'requesting' ? '等待同意…' : '协助中'}
          </button>
        </div>
        {state.screenAssist === 'active' && (
          <div className="assist-bar">
            ● 正在协助 {state.elderName} 看屏
            <button onClick={() => dispatch({ type: 'END_SCREEN_ASSIST' })}>结束</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-h">今日守护</h3>
        {state.meds.map((m) => (
          <div className="row between med-row" key={m.id}>
            <div>
              <strong>⏰ {m.time} {m.name}</strong>
              <div className="muted tiny">{m.dose} · {m.note}</div>
            </div>
            <span className={`tag ${m.status}`}>
              {m.status === 'taken' ? '✅ ' : m.status === 'missed' ? '⚠️ ' : '⏳ '}
              {medLabel[m.status]}
            </span>
          </div>
        ))}
        {dueMed && (
          <button className="link-btn" onClick={() => dispatch({ type: 'TRIGGER_REMINDER', id: dueMed.id })}>
            → 现在提醒{state.elderName}吃「{dueMed.name}」（去父母端看效果）
          </button>
        )}
      </div>

      <div className="card">
        <h3 className="card-h">最近告警</h3>
        {state.alerts.slice(0, 3).map((a) => (
          <div className={`row between alert-row ${a.level}`} key={a.id}>
            <div>
              <strong>{a.title}</strong>
              <div className="muted tiny">{a.detail}</div>
            </div>
            <span className="muted tiny">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
