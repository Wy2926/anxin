import { useState, type CSSProperties } from 'react'
import { useAppState, TILE_LABEL, type ElderTileKey } from '../store.tsx'
import { Icon, type IconName } from '../components/Icon.tsx'
import { TILE_META } from './tileMeta.ts'

export function ElderApp() {
  const { state, active, dispatch } = useAppState()
  const { elderLayout } = active
  const [sosCountdown, setSosCountdown] = useState<number | null>(null)
  const reminder = active.activeReminderId
    ? active.meds.find((m) => m.id === active.activeReminderId)
    : null
  const nextMed = active.meds.find((m) => m.status !== 'taken')

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
    dispatch({ type: 'TRIGGER_REMINDER', id: (nextMed ?? active.meds[0]).id })

  const tileSub: Record<ElderTileKey, string> = {
    call: `给${state.guardianName}`,
    video: '看看家人',
    med: nextMed ? `${nextMed.time} ${nextMed.name}` : '今日已完成',
    album: '全家福',
    radio: '戏曲 · 新闻',
    askChild: '请子女帮忙',
  }

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
      {active.layoutPushedAt && (
        <div className="e-layout-notice">
          <span><Icon name="wand" size={18} /> {state.guardianName}帮你调整了主屏</span>
          <button onClick={() => dispatch({ type: 'DISMISS_LAYOUT_NOTICE' })}>知道了</button>
        </div>
      )}

      {active.screenAssist === 'active' && (
        <div className="e-assist-bar">
          <span><i className="live-dot" /> 孩子正在帮你看手机</span>
          <button onClick={() => dispatch({ type: 'END_SCREEN_ASSIST' })}>结束</button>
        </div>
      )}

      <header className="e-header">
        <div>
          <div className="e-hello">您好，{active.name}</div>
          <div className="e-weather">6月30日 周二 · ☀️ 26℃</div>
        </div>
        <span className="e-avatar">{active.avatar}</span>
      </header>

      {nextMed && (
        <button className="e-next-med" onClick={triggerMed}>
          <span className="e-next-ico"><Icon name="clock" size={22} /></span>
          <span className="e-next-text">
            <b>{nextMed.time} 吃{nextMed.name}</b>
            <small>{nextMed.dose} · {nextMed.note}</small>
          </span>
          <Icon name="chevron" size={20} />
        </button>
      )}

      <div className="e-grid">
        {tiles.map((t) => {
          const meta = TILE_META[t.key]
          return (
            <button key={t.key} className={`e-card ${meta.cls}`} onClick={tileAction(t.key)}>
              <span className="e-ico"><Icon name={meta.icon} size={26} /></span>
              <span className="e-card-text">
                <b>{TILE_LABEL[t.key]}</b>
                <small>{tileSub[t.key]}</small>
              </span>
            </button>
          )
        })}
      </div>

      <div className="e-bottom">
        <button className="e-safe" onClick={() => dispatch({ type: 'REPORT_SAFE' })}>
          <span className="e-safe-ico"><Icon name="check" size={20} /></span>
          <span className="e-safe-text">
            <b>我很好</b>
            {active.lastSafeReport && <small>上次 {active.lastSafeReport}</small>}
          </span>
        </button>
        <button className="e-sos" onClick={startSos}>
          <Icon name="siren" size={26} />
          求救
        </button>
      </div>

      {reminder && (
        <Sheet
          icon="pill"
          tone="med"
          title={`该吃【${reminder.name}】了`}
          sub={`${reminder.dose} · ${reminder.note}`}
          yes="已经吃了"
          no="稍后提醒"
          onYes={() => dispatch({ type: 'TAKE_MED', id: reminder.id })}
          onNo={() => dispatch({ type: 'SNOOZE_MED', id: reminder.id })}
          voice={elderLayout.voice}
        />
      )}

      {active.screenAssist === 'requesting' && (
        <Sheet
          icon="monitor"
          tone="assist"
          title={`${state.guardianName}想帮你看看手机`}
          sub="同意后孩子能看到你的屏幕，随时可结束"
          yes="同意"
          no="拒绝"
          onYes={() => dispatch({ type: 'ACCEPT_SCREEN_ASSIST' })}
          onNo={() => dispatch({ type: 'DECLINE_SCREEN_ASSIST' })}
        />
      )}

      {sosCountdown !== null && (
        <div className="e-modal-mask">
          <div className="e-sheet sos">
            <div className="e-sos-ring">{sosCountdown}</div>
            <div className="e-sheet-title">正在求助…</div>
            <div className="e-sheet-sub">点一下可取消</div>
            <button className="e-cancel" onClick={() => setSosCountdown(null)}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Sheet({
  icon,
  tone,
  title,
  sub,
  yes,
  no,
  onYes,
  onNo,
  voice,
}: {
  icon: IconName
  tone: 'med' | 'assist'
  title: string
  sub: string
  yes: string
  no: string
  onYes: () => void
  onNo: () => void
  voice?: boolean
}) {
  return (
    <div className="e-modal-mask">
      <div className="e-sheet">
        <div className={`e-sheet-ico ${tone}`}><Icon name={icon} size={36} /></div>
        <div className="e-sheet-title">{title}</div>
        <div className="e-sheet-sub">{sub}</div>
        <div className="e-sheet-btns">
          <button className="e-yes" onClick={onYes}>{yes}</button>
          <button className="e-later" onClick={onNo}>{no}</button>
        </div>
        {voice && <div className="e-sheet-voice"><Icon name="mic" size={16} /> 正在语音播报…</div>}
      </div>
    </div>
  )
}
