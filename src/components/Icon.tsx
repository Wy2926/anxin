import type { SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'pill'
  | 'bell'
  | 'user'
  | 'phone'
  | 'video'
  | 'monitor'
  | 'heart'
  | 'siren'
  | 'check'
  | 'chevron'
  | 'battery'
  | 'footprints'
  | 'plus'
  | 'shield'
  | 'image'
  | 'mic'
  | 'x'
  | 'clock'
  | 'radio'
  | 'help'
  | 'arrowUp'
  | 'arrowDown'
  | 'sliders'
  | 'contrast'
  | 'type'
  | 'rotate'
  | 'wand'

const paths: Record<IconName, JSX.Element> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />,
  pill: (
    <>
      <rect x="3.5" y="9" width="17" height="6" rx="3" transform="rotate(45 12 12)" />
      <path d="M8.5 8.5 15.5 15.5" />
    </>
  ),
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 21a2 2 0 0 0 4 0" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="M16 10.5 21 7.5v9l-5-3" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2.5" />
      <path d="M9 21h6M12 17v4" />
    </>
  ),
  heart: <path d="M12 20s-7-4.5-9.5-9A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />,
  siren: (
    <>
      <path d="M7 18v-5a5 5 0 0 1 10 0v5" />
      <path d="M5 21h14M12 4V2M5.5 6 4 4.5M18.5 6 20 4.5" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19.5 7" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  battery: (
    <>
      <rect x="2" y="8" width="17" height="9" rx="2.5" />
      <path d="M22 11.5v2" />
    </>
  ),
  footprints: (
    <path d="M7 16c-1.5 0-2.5-1-2.5-3 0-2.5 1-5.5 2.5-5.5S9.5 9 9.5 11 8.5 16 7 16ZM17 21c-1.5 0-2.5-1-2.5-3 0-2.5 1-5 2.5-5s2.5 2.5 2.5 4.5-1 3.5-2.5 3.5Z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  shield: <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9.5" r="1.7" />
      <path d="M21 16l-5-5L5 21" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  radio: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="2.5" />
      <path d="M7 4.5 17 8" />
      <circle cx="16" cy="14" r="3" />
      <path d="M7 12v0M7 16v0" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.3a2.8 2.8 0 0 1 5.3 1c0 1.8-2.5 2-2.5 3.7M12 17.5v0" />
    </>
  ),
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  sliders: (
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M18 18h2" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="18" r="2" />
    </>
  ),
  contrast: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
    </>
  ),
  type: <path d="M5 6h14M12 6v13M9 19h6" />,
  rotate: (
    <>
      <path d="M4 12a8 8 0 1 1 2.3 5.6" />
      <path d="M4 19v-4h4" />
    </>
  ),
  wand: (
    <>
      <path d="M5 19 17 7M14 4l1.2 2.4L18 7.6l-2.4 1.2L14 11l-1.2-2.2L10 7.6l2.4-1.2L14 4Z" />
    </>
  ),
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 22, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
