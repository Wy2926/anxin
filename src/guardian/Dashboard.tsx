import { useAppState } from '../store.tsx'
import { Icon } from '../components/Icon.tsx'

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
      <header className="g-head">
        <p className="g-sub">早上好</p>
        <h2>给{state.elderName}打个招呼吧</h2>
      </header>

      <div className="card status-card">
        <div className="member-row">
          <span className="avatar xl">👴</span>
          <div className="grow">
            <strong className="lg">{state.elderName}</strong>
            <div className={`status-pill ${state.online ? 'ok' : 'off'}`}>
              <i className="dot" /> {state.online ? '一切正常' : '离线'}
            </div>
          </div>
        </div>
        <div className="metric-row">
          <div className="metric">
            <Icon name="battery" size={18} />
            <div>
              <strong>{state.battery}%</strong>
              <span>电量</span>
            </div>
          </div>
          <div className="metric">
            <Icon name="footprints" size={18} />
            <div>
              <strong>{state.steps.toLocaleString()}</strong>
              <span>步数</span>
            </div>
          </div>
          <div className="metric">
            <Icon name="heart" size={18} />
            <div>
              <strong>72</strong>
              <span>心率</span>
            </div>
          </div>
        </div>
        <div className="quick-actions">
          <button className="qa" onClick={() => alert('正在呼叫：语音通话（原型演示）')}>
            <Icon name="phone" size={20} /> 语音
          </button>
          <button className="qa" onClick={() => alert('正在呼叫：视频通话（原型演示）')}>
            <Icon name="video" size={20} /> 视频
          </button>
          <button
            className="qa primary"
            disabled={state.screenAssist !== 'idle'}
            onClick={() => dispatch({ type: 'REQUEST_SCREEN_ASSIST' })}
          >
            <Icon name="monitor" size={20} />
            {state.screenAssist === 'idle' ? '看屏' : state.screenAssist === 'requesting' ? '等待…' : '协助中'}
          </button>
        </div>
        {state.screenAssist === 'active' && (
          <div className="assist-bar">
            <span><i className="live-dot" /> 正在协助 {state.elderName} 看屏</span>
            <button onClick={() => dispatch({ type: 'END_SCREEN_ASSIST' })}>结束</button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-h"><Icon name="clock" size={18} /> 今日守护</div>
        {state.meds.map((m) => (
          <div className="list-row" key={m.id}>
            <span className={`list-ico ${m.status}`}>
              <Icon name="pill" size={18} />
            </span>
            <div className="grow">
              <strong>{m.time} · {m.name}</strong>
              <div className="muted xs">{m.dose} · {m.note}</div>
            </div>
            <span className={`tag ${m.status}`}>{medLabel[m.status]}</span>
          </div>
        ))}
        {dueMed && (
          <button className="link-btn" onClick={() => dispatch({ type: 'TRIGGER_REMINDER', id: dueMed.id })}>
            现在提醒{state.elderName}吃「{dueMed.name}」 <Icon name="chevron" size={15} />
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-h"><Icon name="bell" size={18} /> 最近告警</div>
        {state.alerts.slice(0, 3).map((a) => (
          <div className={`list-row alert ${a.level}`} key={a.id}>
            <div className="grow">
              <strong>{a.title}</strong>
              <div className="muted xs">{a.detail}</div>
            </div>
            <span className="muted xs">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
