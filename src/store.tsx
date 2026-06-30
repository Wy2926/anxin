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

export interface Alert {
  id: string
  level: 'info' | 'warn' | 'urgent'
  title: string
  detail: string
  time: string
}

export type ScreenAssist = 'idle' | 'requesting' | 'active'

/** 父母端首屏可编排的磁贴种类 */
export type ElderTileKey = 'call' | 'video' | 'med' | 'album' | 'radio' | 'askChild'

export interface ElderTile {
  key: ElderTileKey
  enabled: boolean
}

export type ElderTemplate = 'minimal' | 'standard' | 'rich'

/** 子女远程编排父母端首屏的配置（M7） */
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

export interface AppState {
  elderName: string
  guardianName: string
  online: boolean
  battery: number
  steps: number
  lastSafeReport: string | null
  meds: Medication[]
  alerts: Alert[]
  screenAssist: ScreenAssist
  /** 父母端待弹出的用药提醒（取最近一条 due/missed） */
  activeReminderId: string | null
  /** 当前生效的父母端首屏编排 */
  elderLayout: ElderLayout
  /** 子女最近一次推送编排的时间标签；非空表示父母端有未读「主屏已更新」提示 */
  layoutPushedAt: string | null
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

type Action =
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

function nowLabel(): string {
  return new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

const initialState: AppState = {
  elderName: '爸爸',
  guardianName: '小明',
  online: true,
  battery: 85,
  steps: 3200,
  lastSafeReport: '10:12',
  screenAssist: 'idle',
  activeReminderId: null,
  elderLayout: {
    template: 'standard',
    fontScale: 1,
    highContrast: false,
    voice: true,
    tiles: tilesFromTemplate('standard'),
  },
  layoutPushedAt: null,
  meds: [
    { id: 'm1', name: '降压药', dose: '1 片', time: '08:00', note: '饭后', status: 'taken', stock: 12 },
    { id: 'm2', name: '降糖药', dose: '1 片', time: '12:30', note: '饭前', status: 'due', stock: 6 },
    { id: 'm3', name: '钙片', dose: '2 片', time: '20:00', note: '睡前', status: 'pending', stock: 3 },
  ],
  alerts: [
    { id: 'a0', level: 'info', title: '父母报了平安', detail: '爸爸点击了“我很好”', time: '10:12' },
  ],
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TAKE_MED': {
      const meds = state.meds.map((m) =>
        m.id === action.id
          ? { ...m, status: 'taken' as MedStatus, stock: Math.max(0, m.stock - 1) }
          : m,
      )
      const med = state.meds.find((m) => m.id === action.id)
      const alerts: Alert[] = med
        ? [
            {
              id: uid(),
              level: 'info',
              title: '服药打卡 ✓',
              detail: `${state.elderName}已服用「${med.name}」`,
              time: nowLabel(),
            },
            ...state.alerts,
          ]
        : state.alerts
      return {
        ...state,
        meds,
        alerts,
        activeReminderId: state.activeReminderId === action.id ? null : state.activeReminderId,
      }
    }
    case 'SNOOZE_MED':
      return {
        ...state,
        activeReminderId: state.activeReminderId === action.id ? null : state.activeReminderId,
      }
    case 'TRIGGER_REMINDER':
      return { ...state, activeReminderId: action.id }
    case 'DISMISS_REMINDER':
      return { ...state, activeReminderId: null }
    case 'REQUEST_SCREEN_ASSIST':
      return { ...state, screenAssist: 'requesting' }
    case 'ACCEPT_SCREEN_ASSIST':
      return {
        ...state,
        screenAssist: 'active',
        alerts: [
          { id: uid(), level: 'info', title: '远程协助已开始', detail: `${state.elderName}同意了看屏协助`, time: nowLabel() },
          ...state.alerts,
        ],
      }
    case 'DECLINE_SCREEN_ASSIST':
      return {
        ...state,
        screenAssist: 'idle',
        alerts: [
          { id: uid(), level: 'info', title: '协助被拒绝', detail: `${state.elderName}拒绝了看屏请求`, time: nowLabel() },
          ...state.alerts,
        ],
      }
    case 'END_SCREEN_ASSIST':
      return { ...state, screenAssist: 'idle' }
    case 'SOS':
      return {
        ...state,
        alerts: [
          {
            id: uid(),
            level: 'urgent',
            title: '🆘 紧急求助！',
            detail: `${state.elderName}触发了 SOS，请立即联系`,
            time: nowLabel(),
          },
          ...state.alerts,
        ],
      }
    case 'REPORT_SAFE': {
      const time = nowLabel()
      return {
        ...state,
        lastSafeReport: time,
        alerts: [
          { id: uid(), level: 'info', title: '父母报了平安', detail: `${state.elderName}点击了“我很好”`, time },
          ...state.alerts,
        ],
      }
    }
    case 'ADD_MED':
      return { ...state, meds: [...state.meds, action.med] }
    case 'APPLY_ELDER_LAYOUT': {
      const time = nowLabel()
      const enabledCount = action.layout.tiles.filter((t) => t.enabled).length
      return {
        ...state,
        elderLayout: action.layout,
        layoutPushedAt: time,
        alerts: [
          {
            id: uid(),
            level: 'info',
            title: '父母端主屏已更新',
            detail: `已推送「${TEMPLATE_LABEL[action.layout.template]}」布局 · ${enabledCount} 个入口到${state.elderName}的手机`,
            time,
          },
          ...state.alerts,
        ],
      }
    }
    case 'DISMISS_LAYOUT_NOTICE':
      return { ...state, layoutPushedAt: null }
    default:
      return state
  }
}

interface Store {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppStateContext = createContext<Store | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): Store {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

export { uid }
