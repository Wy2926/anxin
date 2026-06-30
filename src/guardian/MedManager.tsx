import { useState } from 'react'
import { useAppState, uid, bpStatus, type Medication, type BpReading } from '../store.tsx'
import { Icon } from '../components/Icon.tsx'

const medLabel: Record<string, string> = {
  taken: '已服用',
  pending: '待提醒',
  due: '待服用',
  missed: '超时',
}

export function MedManager() {
  const { active, dispatch } = useAppState()
  const [name, setName] = useState('')
  const [time, setTime] = useState('18:00')

  const addMed = () => {
    if (!name.trim()) return
    const med: Medication = {
      id: uid(),
      name: name.trim(),
      dose: '1 片',
      time,
      note: '饭后',
      status: 'pending',
      stock: 10,
    }
    dispatch({ type: 'ADD_MED', med })
    setName('')
  }

  return (
    <div className="g-page">
      <header className="g-head">
        <h2>用药管理</h2>
        <p className="g-sub">为{active.name}编排用药计划</p>
      </header>

      <div className="card">
        <div className="card-h"><Icon name="plus" size={18} /> 添加用药</div>
        <div className="form-row">
          <input placeholder="药品名称，如：阿司匹林" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <button className="btn primary block" onClick={addMed}>添加到计划</button>
      </div>

      <div className="card">
        <div className="card-h"><Icon name="pill" size={18} /> 用药清单</div>
        {active.meds.map((m) => (
          <div className="list-row" key={m.id}>
            <span className={`list-ico ${m.status}`}><Icon name="pill" size={18} /></span>
            <div className="grow">
              <strong>{m.name}</strong>
              <div className="muted xs">{m.time} · {m.dose} · {m.note}</div>
            </div>
            <div className="right">
              <span className={`tag ${m.status}`}>{medLabel[m.status]}</span>
              <div className={`muted xs ${m.stock <= 3 ? 'warn-text' : ''}`}>
                余药 {m.stock}{m.stock <= 3 ? ' · 该补药' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-h"><Icon name="check" size={18} /> 依从率（近 7 日）</div>
        <div className="adherence">
          <div className="bar"><i style={{ width: '86%' }} /></div>
          <strong>86%</strong>
        </div>
        <p className="muted xs">超时未服用会自动升级提醒到你的手机。</p>
      </div>

      <HealthCard />
    </div>
  )
}

function HealthCard() {
  const { active, dispatch } = useAppState()
  const [adding, setAdding] = useState(false)
  const [sys, setSys] = useState('130')
  const [dia, setDia] = useState('85')
  const [hr, setHr] = useState('72')

  const latest = active.bp[active.bp.length - 1]
  const status = bpStatus(latest.sys)
  const sysVals = active.bp.map((b) => b.sys)
  const min = Math.min(...sysVals, 110)
  const max = Math.max(...sysVals, 140)

  const record = () => {
    const reading: BpReading = {
      day: '今天',
      sys: Number(sys) || latest.sys,
      dia: Number(dia) || latest.dia,
      hr: Number(hr) || latest.hr,
    }
    dispatch({ type: 'ADD_BP', reading })
    setAdding(false)
  }

  return (
    <div className="card">
      <div className="card-h"><Icon name="activity" size={18} /> 健康趋势（近 7 日）</div>

      <div className="health-top">
        <div>
          <div className="muted xs">最近血压</div>
          <strong className="lg">{latest.sys}/{latest.dia} <small className="muted">mmHg</small></strong>
        </div>
        <span className={`tag ${status.level === 'warn' ? 'due' : 'taken'}`}>
          {status.level === 'warn' ? '● ' : ''}{status.label}
        </span>
      </div>

      <div className="trend">
        {active.bp.map((b) => {
          const h = 16 + ((b.sys - min) / Math.max(1, max - min)) * 52
          return (
            <div className="trend-col" key={b.day}>
              <i className={bpStatus(b.sys).level === 'warn' ? 'hi' : ''} style={{ height: `${h}px` }} />
              <span>{b.day}</span>
            </div>
          )
        })}
      </div>
      <p className="muted xs">收缩压范围 {min}–{max} mmHg · 心率 {latest.hr} bpm。读数偏高会提醒你并建议复诊。</p>

      {adding ? (
        <>
          <div className="form-row">
            <input type="number" value={sys} onChange={(e) => setSys(e.target.value)} placeholder="收缩压" />
            <input type="number" value={dia} onChange={(e) => setDia(e.target.value)} placeholder="舒张压" />
            <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="心率" />
          </div>
          <button className="btn primary block" onClick={record}>保存这次读数</button>
        </>
      ) : (
        <button className="link-btn" onClick={() => setAdding(true)}>
          <Icon name="plus" size={15} /> 记一次血压
        </button>
      )}
    </div>
  )
}
