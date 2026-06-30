import type { IconName } from '../components/Icon.tsx'
import type { ElderTileKey } from '../store.tsx'

export interface TileMeta {
  icon: IconName
  /** 磁贴配色 class（对应 styles.css 中 .e-card.<cls>） */
  cls: string
}

/** 父母端首屏磁贴的图标与配色（子女端预览与父母端实机共用，保证一致） */
export const TILE_META: Record<ElderTileKey, TileMeta> = {
  call: { icon: 'phone', cls: 'call' },
  video: { icon: 'video', cls: 'video' },
  med: { icon: 'pill', cls: 'med' },
  album: { icon: 'image', cls: 'album' },
  radio: { icon: 'radio', cls: 'radio' },
  askChild: { icon: 'help', cls: 'ask' },
}
