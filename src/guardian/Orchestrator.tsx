import { useState, type CSSProperties } from 'react'
import {
  useAppState,
  tilesFromTemplate,
  TEMPLATE_LABEL,
  TILE_LABEL,
  type ElderLayout,
  type ElderTemplate,
  type ElderTile,
} from '../store.tsx'
import { Icon } from '../components/Icon.tsx'
import { TILE_META } from '../elder/tileMeta.ts'

const TEMPLATES: ElderTemplate[] = ['minimal', 'standard', 'rich']

export function Orchestrator({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useAppState()
  const [draft, setDraft] = useState<ElderLayout>(state.elderLayout)

  const patch = (p: Partial<ElderLayout>) => setDraft((d) => ({ ...d, ...p }))

  const pickTemplate = (template: ElderTemplate) =>
    setDraft((d) => ({ ...d, template, tiles: tilesFromTemplate(template) }))

  const toggleTile = (idx: number) =>
    setDraft((d) => ({
      ...d,
      tiles: d.tiles.map((t, i) => (i === idx ? { ...t, enabled: !t.enabled } : t)),
    }))

  const moveTile = (idx: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = idx + dir
      if (j < 0 || j >= d.tiles.length) return d
      const tiles = [...d.tiles]
      ;[tiles[idx], tiles[j]] = [tiles[j], tiles[idx]]
      return { ...d, tiles }
    })

  const enabledCount = draft.tiles.filter((t) => t.enabled).length
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.elderLayout)

  return (
    <div className="g-app orch">
      <header className="orch-bar">
        <button className="orch-back" onClick={onClose} aria-label="返回">
          <Icon name="chevron" size={22} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="grow">
          <strong>编排「{state.elderName}」的手机</strong>
          <div className="muted xs">配置首屏 → 一键推送到设备生效</div>
        </div>
        <button className="orch-reset" onClick={() => setDraft(state.elderLayout)} disabled={!dirty}>
          <Icon name="rotate" size={16} /> 还原
        </button>
      </header>

      <div className="g-body orch-body">
        <div className="orch-grid">
          <div className="orch-controls">
            <div className="card">
              <div className="card-h"><Icon name="wand" size={18} /> 布局模板</div>
              <div className="orch-templates">
                {TEMPLATES.map((t) => (
                  <button
                    key={t}
                    className={`orch-tpl ${draft.template === t ? 'on' : ''}`}
                    onClick={() => pickTemplate(t)}
                  >
                    <strong>{TEMPLATE_LABEL[t]}</strong>
                    <span>{tilesFromTemplate(t).filter((x) => x.enabled).length} 个入口</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-h"><Icon name="sliders" size={18} /> 适老设置</div>
              <div className="orch-set">
                <div className="orch-set-row">
                  <span><Icon name="type" size={16} /> 字号</span>
                  <input
                    type="range" min={100} max={140} step={10}
                    value={Math.round(draft.fontScale * 100)}
                    onChange={(e) => patch({ fontScale: Number(e.target.value) / 100 })}
                  />
                  <b>{draft.fontScale.toFixed(1)}×</b>
                </div>
                <div className="perm-row">
                  <span className="grow"><Icon name="contrast" size={16} /> 高对比模式</span>
                  <button
                    className={`toggle ${draft.highContrast ? 'on' : ''}`}
                    role="switch" aria-checked={draft.highContrast}
                    onClick={() => patch({ highContrast: !draft.highContrast })}
                  ><i /></button>
                </div>
                <div className="perm-row">
                  <span className="grow"><Icon name="mic" size={16} /> 语音播报</span>
                  <button
                    className={`toggle ${draft.voice ? 'on' : ''}`}
                    role="switch" aria-checked={draft.voice}
                    onClick={() => patch({ voice: !draft.voice })}
                  ><i /></button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h"><Icon name="home" size={18} /> 首屏入口（排序 / 开关）</div>
              <div className="orch-locked">
                <span className="list-ico missed"><Icon name="siren" size={16} /></span>
                <div className="grow"><strong>求救 SOS</strong><div className="muted xs">常驻 · 不可移除</div></div>
                <span className="chip">锁定</span>
              </div>
              {draft.tiles.map((tile, idx) => (
                <TileRow
                  key={tile.key}
                  tile={tile}
                  first={idx === 0}
                  last={idx === draft.tiles.length - 1}
                  onToggle={() => toggleTile(idx)}
                  onUp={() => moveTile(idx, -1)}
                  onDown={() => moveTile(idx, 1)}
                />
              ))}
            </div>
          </div>

          <div className="orch-preview">
            <div className="muted xs" style={{ textAlign: 'center', marginBottom: 8 }}>父母端实时预览</div>
            <ElderPreview draft={draft} guardianName={state.guardianName} elderName={state.elderName} />
          </div>
        </div>
      </div>

      <div className="orch-foot">
        <button
          className="btn primary block"
          disabled={!dirty || enabledCount === 0}
          onClick={() => dispatch({ type: 'APPLY_ELDER_LAYOUT', layout: draft })}
        >
          {enabledCount === 0 ? '至少保留 1 个入口' : dirty ? `推送到 ${state.elderName} 的设备` : '已是最新'}
        </button>
      </div>
    </div>
  )
}

function TileRow({
  tile, first, last, onToggle, onUp, onDown,
}: {
  tile: ElderTile
  first: boolean
  last: boolean
  onToggle: () => void
  onUp: () => void
  onDown: () => void
}) {
  const meta = TILE_META[tile.key]
  return (
    <div className={`orch-tile ${tile.enabled ? '' : 'off'}`}>
      <div className="orch-move">
        <button onClick={onUp} disabled={first} aria-label="上移"><Icon name="arrowUp" size={15} /></button>
        <button onClick={onDown} disabled={last} aria-label="下移"><Icon name="arrowDown" size={15} /></button>
      </div>
      <span className={`list-ico ${meta.cls}`}><Icon name={meta.icon} size={17} /></span>
      <strong className="grow">{TILE_LABEL[tile.key]}</strong>
      <button
        className={`toggle ${tile.enabled ? 'on' : ''}`}
        role="switch" aria-checked={tile.enabled} onClick={onToggle}
      ><i /></button>
    </div>
  )
}

function ElderPreview({
  draft, guardianName, elderName,
}: {
  draft: ElderLayout
  guardianName: string
  elderName: string
}) {
  const tiles = draft.tiles.filter((t) => t.enabled)
  const style = { '--e-scale': draft.fontScale } as CSSProperties
  return (
    <div className="mini-phone">
      <div className={`mini-screen${draft.highContrast ? ' hc' : ''}`} style={style}>
        <div className="mini-hello">您好，{elderName}</div>
        <div className="mini-grid">
          {tiles.map((t) => {
            const meta = TILE_META[t.key]
            return (
              <div key={t.key} className={`mini-card ${meta.cls}`}>
                <Icon name={meta.icon} size={18} />
                <span>{t.key === 'call' ? `给${guardianName}打电话` : TILE_LABEL[t.key]}</span>
              </div>
            )
          })}
        </div>
        <div className="mini-bottom">
          <div className="mini-safe">我很好</div>
          <div className="mini-sos">求救</div>
        </div>
      </div>
    </div>
  )
}
