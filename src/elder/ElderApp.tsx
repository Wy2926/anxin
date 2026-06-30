import { useState } from 'react'
import { useAppState } from '../store.tsx'
import { Icon, type IconName } from '../components/Icon.tsx'

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

  const tiles: { cls: string; icon: IconName; label: string; onClick: () => void }[] = [
    { cls: 'call', icon: 'phone', label: `给${state.guardianName}打电话`, onClick: () => alert(`正在拨打：${state.guardianName}（原型演示）`) },
    { cls: 'video', icon: 'video', label: '视频家人', onClick: () => alert('正在发起视频（原型演示）') },
    {
      cls: 'med',
      icon: 'pill',
      label: '我的吃药',
      onClick: () =>
        dispatch({ type: 'TRIGGER_REMINDER', id: state.meds.find((m) => m.status !== 'taken')?.id ?? state.meds[0].id }),
    },
    { cls: 'album', icon: 'image', label: '家庭相册', onClick: () => alert('打开家庭相册（原型演示）') },
  ]

  return (
    <div className="e-app">
      {state.screenAssist === 'active' && (
        <div className="e-assist-bar">
          <span><i className="live-dot" /> 孩子正在帮你看手机</span>
          <button onClick={() => dispatch({ type: 'END_SCREEN_ASSIST' })}>结 束</button>
        </div>
      )}

      <div className="e-greeting">
        <span className="e-weather">☀️ 26℃ 多云 · 空气良</span>
        <span className="e-hello">您好，{state.elderName}</span>
      </div>

      <div className="e-grid">
        {tiles.map((t) => (
          <button key={t.cls} className={`e-card ${t.cls}`} onClick={t.onClick}>
            <span className="e-ico"><Icon name={t.icon} size={34} /></span>
            <span className="e-card-label">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="e-care">
        <span className="e-care-ico"><Icon name="clock" size={20} /></span>
        记得 12:30 吃降糖药，饭前一片
      </div>

      <div className="e-bottom">
        <button className="e-safe" onClick={() => dispatch({ type: 'REPORT_SAFE' })}>
          <span className="e-safe-ico"><Icon name="check" size={22} /></span>
          <span>我很好{state.lastSafeReport && <small>上次 {state.lastSafeReport}</small>}</span>
        </button>
        <button className="e-sos" onClick={startSos}>
          <Icon name="siren" size={28} />
          求救
        </button>
      </div>

      {reminder && (
        <div className="e-modal-mask">
          <div className="e-sheet">
            <div className="e-sheet-ico med"><Icon name="pill" size={40} /></div>
            <div className="e-sheet-title">该吃【{reminder.name}】了</div>
            <div className="e-sheet-sub">{reminder.dose} · {reminder.note}</div>
            <div className="e-sheet-btns">
              <button className="e-yes" onClick={() => dispatch({ type: 'TAKE_MED', id: reminder.id })}>已经吃了</button>
              <button className="e-later" onClick={() => dispatch({ type: 'SNOOZE_MED', id: reminder.id })}>稍后提醒</button>
            </div>
            <div className="e-sheet-voice"><Icon name="mic" size={16} /> 正在语音播报…</div>
          </div>
        </div>
      )}

      {state.screenAssist === 'requesting' && (
        <div className="e-modal-mask">
          <div className="e-sheet">
            <div className="e-sheet-ico assist"><Icon name="monitor" size={40} /></div>
            <div className="e-sheet-title">{state.guardianName}想帮你看看手机</div>
            <div className="e-sheet-sub">同意后孩子能看到你的屏幕，随时可结束</div>
            <div className="e-sheet-btns">
              <button className="e-yes" onClick={() => dispatch({ type: 'ACCEPT_SCREEN_ASSIST' })}>同 意</button>
              <button className="e-later" onClick={() => dispatch({ type: 'DECLINE_SCREEN_ASSIST' })}>拒 绝</button>
            </div>
          </div>
        </div>
      )}

      {sosCountdown !== null && (
        <div className="e-modal-mask">
          <div className="e-sheet sos">
            <div className="e-sos-ring">{sosCountdown}</div>
            <div className="e-sheet-title">正在求助…</div>
            <div className="e-sheet-sub">点一下可取消</div>
            <button className="e-cancel" onClick={() => setSosCountdown(null)}>取 消</button>
          </div>
        </div>
      )}
    </div>
  )
}
