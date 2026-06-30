import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

export type MedStatus = 'taken' | 'pending' | 'due' | 'missed'

export interface Medication {
  id: string
  name: string
  dose: string
  time: string
  note: string
  status: MedStatus
  stock: number
}

export type ScreenAssist = 'idle' | 'requesting' | 'active'

/** 父母端首屏可编排的磁贴种类 */
export type ElderTileKey = 'call' | 'video' | 'med' | 'album' | 'radio' | 'askChild'

export interface ElderTile {
  key: ElderTileKey
  enabled: boolean
}

export type ElderTemplate = 'minimal' | 'standard' | 'rich'

/** 子女远程编排某位父母首屏的配置（M7，按家长各自保存） */
export interface ElderLayout {
  template: ElderTemplate
  /** 适老字号缩放，1.0–1.4 */
  fontScale: number
  highContrast: boolean
  /** 语音播报 */
  voice: boolean
  /** 磁贴的顺序与开关；SOS 常驻、不在此列 */
  tiles: ElderTile[]
}

export interface Elder {
  id: string
  name: string
  relation: string
  avatar: string
  online: boolean
  battery: number
  steps: number
  heart: number
  lastSafeReport: string | null
  meds: Medication[]
  screenAssist: ScreenAssist
  activeReminderId: string | null
  /** 当前生效的首屏编排 */
  elderLayout: ElderLayout
  /** 子女最近一次推送编排的时间标签；非空表示该家长有未读「主屏已更新」提示 */
  layoutPushedAt: string | null
  /** 近 7 日血压/心率读数（趋势用，最后一项为最新） */
  bp: BpReading[]
  /** 敏感访问留痕（最新在前） */
  audit: AuditEntry[]
}

export interface Alert {
  id: string
  elderId: string
  level: 'info' | 'warn' | 'urgent'
  title: string
  detail: string
  time: string
}

/** 一次血压/心率读数（趋势用） */
export interface BpReading {
  day: string
  sys: number
  dia: number
  hr: number
}

/** 敏感访问留痕（看屏 / 推送布局 / 定位 / 读取健康），父母可见、不可篡改 */
export type AuditScope = 'screen' | 'layout' | 'location' | 'health'

export interface AuditEntry {
  id: string
  elderId: string
  scope: AuditScope
  action: string
  detail: string
  time: string
}

export interface AppState {
  guardianName: string
  elders: Elder[]
  activeElderId: string
  alerts: Alert[]
}

export const TEMPLATE_LABEL: Record<ElderTemplate, string> = {
  minimal: '极简',
  standard: '标准',
  rich: '丰富',
}

/** 磁贴文案；图标在视图层按 key 映射，父母端 call 标题会拼上守护者称呼 */
export const TILE_LABEL: Record<ElderTileKey, string> = {
  call: '打电话',
  video: '视频家人',
  med: '我的吃药',
  album: '家庭相册',
  radio: '收音机',
  askChild: '遇事问子女',
}

/** 三套预设模板对应的磁贴组合（顺序即展示顺序） */
export const TEMPLATE_TILES: Record<ElderTemplate, ElderTileKey[]> = {
  minimal: ['call', 'med'],
  standard: ['call', 'video', 'med', 'album'],
  rich: ['call', 'video', 'med', 'album', 'radio', 'askChild'],
}

const ALL_TILE_KEYS: ElderTileKey[] = ['call', 'video', 'med', 'album', 'radio', 'askChild']

/** 由模板生成完整磁贴列表：模板内的置前并开启，其余置后并关闭，保持可再开关 */
export function tilesFromTemplate(template: ElderTemplate): ElderTile[] {
  const on = TEMPLATE_TILES[template]
  const rest = ALL_TILE_KEYS.filter((k) => !on.includes(k))
  return [...on, ...rest].map((key) => ({ key, enabled: on.includes(key) }))
}

function layout(template: ElderTemplate, extra?: Partial<ElderLayout>): ElderLayout {
  return { template, fontScale: 1, highContrast: false, voice: true, tiles: tilesFromTemplate(template), ...extra }
}

type Action =
  | { type: 'SET_ACTIVE_ELDER'; id: string }
  | { type: 'TAKE_MED'; id: string }
  | { type: 'SNOOZE_MED'; id: string }
  | { type: 'TRIGGER_REMINDER'; id: string }
  | { type: 'DISMISS_REMINDER' }
  | { type: 'REQUEST_SCREEN_ASSIST' }
  | { type: 'ACCEPT_SCREEN_ASSIST' }
  | { type: 'DECLINE_SCREEN_ASSIST' }
  | { type: 'END_SCREEN_ASSIST' }
  | { type: 'SOS' }
  | { type: 'REPORT_SAFE' }
  | { type: 'ADD_MED'; med: Medication }
  | { type: 'APPLY_ELDER_LAYOUT'; layout: ElderLayout }
  | { type: 'DISMISS_LAYOUT_NOTICE' }
  | { type: 'ADD_BP'; reading: BpReading }

function nowLabel(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

function audit(elderId: string, scope: AuditScope, action: string, detail: string): AuditEntry {
  return { id: uid(), elderId, scope, action, detail, time: nowLabel() }
}

/** 收缩压分级：用于趋势卡的状态语义（不只靠颜色，配文案） */
export function bpStatus(sys: number): { level: 'ok' | 'warn'; label: string } {
  return sys >= 140 || sys < 90 ? { level: 'warn', label: '偏高' } : { level: 'ok', label: '平稳' }
}

const initialState: AppState = {
  guardianName: '小明',
  activeElderId: 'e1',
  elders: [
    {
      id: 'e1',
      name: '爸爸',
      relation: '父亲 · 赵建国',
      avatar: '👴',
      online: true,
      battery: 85,
      steps: 3200,
      heart: 72,
      lastSafeReport: '10:12',
      screenAssist: 'idle',
      activeReminderId: null,
      elderLayout: layout('standard'),
      layoutPushedAt: null,
      bp: [
        { day: '周三', sys: 132, dia: 84, hr: 70 },
        { day: '周四', sys: 128, dia: 82, hr: 72 },
        { day: '周五', sys: 141, dia: 90, hr: 78 },
        { day: '周六', sys: 126, dia: 80, hr: 69 },
        { day: '周日', sys: 136, dia: 86, hr: 74 },
        { day: '周一', sys: 130, dia: 83, hr: 71 },
        { day: '今天', sys: 138, dia: 88, hr: 72 },
      ],
      audit: [
        { id: 'e1au1', elderId: 'e1', scope: 'layout', action: '推送首屏布局', detail: '「标准」布局 · 4 个入口', time: '09:50' },
        { id: 'e1au2', elderId: 'e1', scope: 'health', action: '读取血压记录', detail: '查看近 7 日趋势', time: '昨天 19:02' },
        { id: 'e1au3', elderId: 'e1', scope: 'location', action: '定位授权（单次）', detail: '已于当晚自动失效', time: '前天 20:10' },
      ],
      meds: [
        { id: 'e1m1', name: '降压药', dose: '1 片', time: '08:00', note: '饭后', status: 'taken', stock: 12 },
        { id: 'e1m2', name: '降糖药', dose: '1 片', time: '12:30', note: '饭前', status: 'due', stock: 6 },
        { id: 'e1m3', name: '钙片', dose: '2 片', time: '20:00', note: '睡前', status: 'pending', stock: 3 },
      ],
    },
    {
      id: 'e2',
      name: '妈妈',
      relation: '母亲 · 李秀兰',
      avatar: '👵',
      online: true,
      battery: 64,
      steps: 5100,
      heart: 76,
      lastSafeReport: '09:40',
      screenAssist: 'idle',
      activeReminderId: null,
      elderLayout: layout('minimal', { fontScale: 1.2 }),
      layoutPushedAt: null,
      bp: [
        { day: '周三', sys: 120, dia: 78, hr: 74 },
        { day: '周四', sys: 122, dia: 79, hr: 75 },
        { day: '周五', sys: 118, dia: 76, hr: 73 },
        { day: '周六', sys: 124, dia: 80, hr: 77 },
        { day: '周日', sys: 119, dia: 77, hr: 74 },
        { day: '周一', sys: 121, dia: 78, hr: 76 },
        { day: '今天', sys: 122, dia: 79, hr: 76 },
      ],
      audit: [
        { id: 'e2au1', elderId: 'e2', scope: 'layout', action: '推送首屏布局', detail: '「极简」布局 · 字号 1.2×', time: '08:30' },
      ],
      meds: [
        { id: 'e2m1', name: '钙片', dose: '1 片', time: '09:00', note: '早餐后', status: 'taken', stock: 20 },
        { id: 'e2m2', name: '阿司匹林', dose: '1 片', time: '19:00', note: '睡前', status: 'pending', stock: 9 },
      ],
    },
  ],
  alerts: [
    { id: 'a0', elderId: 'e1', level: 'info', title: '父母报了平安', detail: '爸爸点击了“我很好”', time: '10:12' },
    { id: 'a1', elderId: 'e2', level: 'info', title: '父母报了平安', detail: '妈妈点击了“我很好”', time: '09:40' },
  ],
}

function mapActive(state: AppState, fn: (e: Elder) => Elder): Elder[] {
  return state.elders.map((e) => (e.id === state.activeElderId ? fn(e) : e))
}

function activeElder(state: AppState): Elder {
  return state.elders.find((e) => e.id === state.activeElderId) ?? state.elders[0]
}

function reducer(state: AppState, action: Action): AppState {
  const active = activeElder(state)
  switch (action.type) {
    case 'SET_ACTIVE_ELDER':
      return { ...state, activeElderId: action.id }
    case 'TAKE_MED': {
      const med = active.meds.find((m) => m.id === action.id)
      const elders = mapActive(state, (e) => ({
        ...e,
        activeReminderId: e.activeReminderId === action.id ? null : e.activeReminderId,
        meds: e.meds.map((m) =>
          m.id === action.id ? { ...m, status: 'taken' as MedStatus, stock: Math.max(0, m.stock - 1) } : m,
        ),
      }))
      const alerts: Alert[] = med
        ? [
            { id: uid(), elderId: active.id, level: 'info', title: '服药打卡 ✓', detail: `${active.name}已服用「${med.name}」`, time: nowLabel() },
            ...state.alerts,
          ]
        : state.alerts
      return { ...state, elders, alerts }
    }
    case 'SNOOZE_MED':
      return {
        ...state,
        elders: mapActive(state, (e) => ({
          ...e,
          activeReminderId: e.activeReminderId === action.id ? null : e.activeReminderId,
        })),
      }
    case 'TRIGGER_REMINDER':
      return { ...state, elders: mapActive(state, (e) => ({ ...e, activeReminderId: action.id })) }
    case 'DISMISS_REMINDER':
      return { ...state, elders: mapActive(state, (e) => ({ ...e, activeReminderId: null })) }
    case 'REQUEST_SCREEN_ASSIST':
      return { ...state, elders: mapActive(state, (e) => ({ ...e, screenAssist: 'requesting' })) }
    case 'ACCEPT_SCREEN_ASSIST':
      return {
        ...state,
        elders: mapActive(state, (e) => ({
          ...e,
          screenAssist: 'active',
          audit: [audit(e.id, 'screen', '看屏协助开始', `${state.guardianName}发起 · 限时 10 分钟`), ...e.audit],
        })),
        alerts: [
          { id: uid(), elderId: active.id, level: 'info', title: '远程协助已开始', detail: `${active.name}同意了看屏协助`, time: nowLabel() },
          ...state.alerts,
        ],
      }
    case 'DECLINE_SCREEN_ASSIST':
      return {
        ...state,
        elders: mapActive(state, (e) => ({ ...e, screenAssist: 'idle' })),
        alerts: [
          { id: uid(), elderId: active.id, level: 'info', title: '协助被拒绝', detail: `${active.name}拒绝了看屏请求`, time: nowLabel() },
          ...state.alerts,
        ],
      }
    case 'END_SCREEN_ASSIST':
      return {
        ...state,
        elders: mapActive(state, (e) => ({
          ...e,
          screenAssist: 'idle',
          audit: e.screenAssist === 'active'
            ? [audit(e.id, 'screen', '看屏协助结束', '会话已断开 · 已留痕'), ...e.audit]
            : e.audit,
        })),
      }
    case 'SOS':
      return {
        ...state,
        alerts: [
          { id: uid(), elderId: active.id, level: 'urgent', title: '🆘 紧急求助！', detail: `${active.name}触发了 SOS，请立即联系`, time: nowLabel() },
          ...state.alerts,
        ],
      }
    case 'REPORT_SAFE': {
      const time = nowLabel()
      return {
        ...state,
        elders: mapActive(state, (e) => ({ ...e, lastSafeReport: time })),
        alerts: [
          { id: uid(), elderId: active.id, level: 'info', title: '父母报了平安', detail: `${active.name}点击了“我很好”`, time },
          ...state.alerts,
        ],
      }
    }
    case 'ADD_MED':
      return { ...state, elders: mapActive(state, (e) => ({ ...e, meds: [...e.meds, action.med] })) }
    case 'APPLY_ELDER_LAYOUT': {
      const time = nowLabel()
      const enabledCount = action.layout.tiles.filter((t) => t.enabled).length
      return {
        ...state,
        elders: mapActive(state, (e) => ({
          ...e,
          elderLayout: action.layout,
          layoutPushedAt: time,
          audit: [audit(e.id, 'layout', '推送首屏布局', `「${TEMPLATE_LABEL[action.layout.template]}」· ${enabledCount} 个入口`), ...e.audit],
        })),
        alerts: [
          {
            id: uid(),
            elderId: active.id,
            level: 'info',
            title: '父母端主屏已更新',
            detail: `已推送「${TEMPLATE_LABEL[action.layout.template]}」布局 · ${enabledCount} 个入口到${active.name}的手机`,
            time,
          },
          ...state.alerts,
        ],
      }
    }
    case 'DISMISS_LAYOUT_NOTICE':
      return { ...state, elders: mapActive(state, (e) => ({ ...e, layoutPushedAt: null })) }
    case 'ADD_BP':
      return {
        ...state,
        elders: mapActive(state, (e) => ({
          ...e,
          heart: action.reading.hr,
          bp: [...e.bp.slice(-6), action.reading],
        })),
        alerts: [
          {
            id: uid(),
            elderId: active.id,
            level: bpStatus(action.reading.sys).level === 'warn' ? 'warn' : 'info',
            title: bpStatus(action.reading.sys).level === 'warn' ? '血压偏高提醒' : '血压已记录',
            detail: `${active.name} ${action.reading.sys}/${action.reading.dia} mmHg · 心率 ${action.reading.hr}`,
            time: nowLabel(),
          },
          ...state.alerts,
        ],
      }
    default:
      return state
  }
}

interface Store {
  state: AppState
  active: Elder
  dispatch: React.Dispatch<Action>
}

const AppStateContext = createContext<Store | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, active: activeElder(state), dispatch }), [state])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): Store {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

export { uid }
