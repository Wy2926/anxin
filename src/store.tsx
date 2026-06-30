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
