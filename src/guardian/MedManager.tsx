import { useState } from 'react'
import { useAppState, uid, type Medication } from '../store.tsx'

export function MedManager() {
  const { state, dispatch } = useAppState()
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
      <h2 className="g-title">用药管理</h2>

      <div className="card">
        <h3 className="card-h">为{state.elderName}添加用药</h3>
        <div className="form-row">
          <input
            placeholder="药品名称，如：阿司匹林"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <button className="btn primary" onClick={addMed}>添加</button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-h">用药清单与依从</h3>
        {state.meds.map((m) => (
          <div className="row between med-manage" key={m.id}>
            <div>
              <strong>{m.name}</strong>
              <div className="muted tiny">{m.time} · {m.dose} · {m.note}</div>
            </div>
            <div className="right">
              <span className={`tag ${m.status}`}>
                {m.status === 'taken' ? '已服用' : m.status === 'missed' ? '超时' : m.status === 'due' ? '待服用' : '待提醒'}
              </span>
              <div className={`muted tiny ${m.stock <= 3 ? 'warn-text' : ''}`}>
                余药 {m.stock}{m.stock <= 3 ? ' · 该补药了' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-h">依从率（近7日 · 演示）</h3>
        <div className="adherence">
          <div className="bar"><i style={{ width: '86%' }} /></div>
          <strong>86%</strong>
        </div>
        <p className="muted tiny">超时未服用会自动升级提醒到你的手机。</p>
      </div>
    </div>
  )
}
