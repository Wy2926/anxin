import { useState } from 'react'
import { useAppState, uid, type Medication } from '../store.tsx'
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
    </div>
  )
}
