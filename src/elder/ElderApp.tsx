import { useState, type CSSProperties } from 'react'
import { useAppState, TILE_LABEL, type ElderTileKey } from '../store.tsx'
import { Icon } from '../components/Icon.tsx'
import { TILE_META } from './tileMeta.ts'

export function ElderApp() {
  const { state, dispatch } = useAppState()
  const { elderLayout } = state
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

  const triggerMed = () =>
    dispatch({ type: 'TRIGGER_REMINDER', id: state.meds.find((m) => m.status !== 'taken')?.id ?? state.meds[0].id })

  const tileLabel = (key: ElderTileKey) =>
    key === 'call' ? `给${state.guardianName}打电话` : TILE_LABEL[key]

  const tileAction = (key: ElderTileKey): (() => void) => {
    switch (key) {
      case 'call': return () => alert(`正在拨打：${state.guardianName}（原型演示）`)
      case 'video': return () => alert('正在发起视频（原型演示）')
      case 'med': return triggerMed
      case 'album': return () => alert('打开家庭相册（原型演示）')
      case 'radio': return () => alert('打开收音机 · 戏曲台（原型演示）')
      case 'askChild': return () => alert(`已把当前页面发给${state.guardianName}帮你看看（原型演示）`)
    }
  }

  const tiles = elderLayout.tiles.filter((t) => t.enabled)
  const appStyle = { '--e-scale': elderLayout.fontScale } as CSSProperties

  return (
    <div className={`e-app${elderLayout.highContrast ? ' hc' : ''}`} style={appStyle}>
      {state.layoutPushedAt && (
        <div className="e-layout-notice">
          <span><Icon name="wand" size={18} /> {state.guardianName}帮你调整了主屏</span>
          <button onClick={() => dispatch({ type: 'DISMISS_LAYOUT_NOTICE' })}>知道了</button>
        </div>
      )}

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
        {tiles.map((t) => {
          const meta = TILE_META[t.key]
          return (
            <button key={t.key} className={`e-card ${meta.cls}`} onClick={tileAction(t.key)}>
              <span className="e-ico"><Icon name={meta.icon} size={34} /></span>
              <span className="e-card-label">{tileLabel(t.key)}</span>
            </button>
          )
        })}
      </div>

      <div className="e-care">
        <span className="e-care-ico"><Icon name="clock" size={20} /></span>
        <span className="grow">记得 12:30 吃降糖药，饭前一片</span>
        {elderLayout.voice && <span className="e-care-voice"><Icon name="mic" size={18} /></span>}
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
            {elderLayout.voice && (
              <div className="e-sheet-voice"><Icon name="mic" size={16} /> 正在语音播报…</div>
            )}
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
