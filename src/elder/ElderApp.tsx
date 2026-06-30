import { useState } from 'react'
import { useAppState } from '../store.tsx'

export function ElderApp() {
  const { state, dispatch } = useAppState()
  const [sosCountdown, setSosCountdown] = useState<number | null>(null)
  const reminder = state.activeReminderId
    ? state.meds.find((m) => m.id === state.activeReminderId)
    : null

  const startSos = () => {
    let n = 3
    setSosCountdown(n)
    const timer = setInterval(() => {
      n -= 1
      if (n <= 0) {
        clearInterval(timer)
        setSosCountdown(null)
        dispatch({ type: 'SOS' })
        alert('已向所有家人发出求助！（原型演示）')
      } else {
        setSosCountdown(n)
      }
    }, 1000)
  }

  return (
    <div className="e-app">
      {state.screenAssist === 'active' && (
        <div className="e-assist-bar">
          ● 孩子正在帮你看手机
          <button onClick={() => dispatch({ type: 'END_SCREEN_ASSIST' })}>结 束</button>
        </div>
      )}

      <div className="e-greeting">
        <span className="e-weather">☀️ 26℃ 多云</span>
        <span className="e-hello">您好，{state.elderName}</span>
      </div>

      <div className="e-grid">
        <button className="e-card call" onClick={() => alert(`正在拨打：${state.guardianName}（原型演示）`)}>
          <span className="e-ico">📞</span>
          给{state.guardianName}打电话
        </button>
        <button className="e-card video" onClick={() => alert('正在发起视频（原型演示）')}>
          <span className="e-ico">📹</span>
          视频家人
        </button>
        <button className="e-card med" onClick={() => dispatch({ type: 'TRIGGER_REMINDER', id: state.meds.find((m) => m.status !== 'taken')?.id ?? state.meds[0].id })}>
          <span className="e-ico">💊</span>
          我的吃药
        </button>
        <button className="e-card album" onClick={() => alert('打开家庭相册（原型演示）')}>
          <span className="e-ico">🖼️</span>
          家庭相册
        </button>
      </div>

      <div className="e-care">记得 12:30 吃降糖药，饭前一片 💊</div>

      <div className="e-bottom">
        <button className="e-safe" onClick={() => dispatch({ type: 'REPORT_SAFE' })}>
          😊 我很好
          {state.lastSafeReport && <small>上次 {state.lastSafeReport}</small>}
        </button>
        <button className="e-sos" onClick={startSos}>
          🆘<br />求救
        </button>
      </div>

      {reminder && (
        <div className="e-modal-mask">
          <div className="e-reminder">
            <div className="e-reminder-ico">💊</div>
            <div className="e-reminder-title">该吃【{reminder.name}】了</div>
            <div className="e-reminder-sub">{reminder.dose} · {reminder.note}</div>
            <div className="e-reminder-btns">
              <button className="e-yes" onClick={() => dispatch({ type: 'TAKE_MED', id: reminder.id })}>✓ 已经吃了</button>
              <button className="e-later" onClick={() => dispatch({ type: 'SNOOZE_MED', id: reminder.id })}>稍后提醒</button>
            </div>
            <div className="e-reminder-voice">🔊 正在语音播报…</div>
          </div>
        </div>
      )}

      {state.screenAssist === 'requesting' && (
        <div className="e-modal-mask">
          <div className="e-consent">
            <div className="e-consent-ico">🖥️</div>
            <div className="e-consent-title">{state.guardianName}想帮你看看手机</div>
            <div className="e-consent-sub">同意后孩子能看到你的屏幕，随时可以结束</div>
            <div className="e-reminder-btns">
              <button className="e-yes" onClick={() => dispatch({ type: 'ACCEPT_SCREEN_ASSIST' })}>同 意</button>
              <button className="e-later" onClick={() => dispatch({ type: 'DECLINE_SCREEN_ASSIST' })}>拒 绝</button>
            </div>
          </div>
        </div>
      )}

      {sosCountdown !== null && (
        <div className="e-modal-mask">
          <div className="e-sos-count">
            <div className="e-sos-num">{sosCountdown}</div>
            <div>正在求助，点一下可取消</div>
            <button className="e-cancel" onClick={() => setSosCountdown(null)}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
