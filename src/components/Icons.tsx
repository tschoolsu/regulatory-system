interface IconProps {
  className?: string
}

function Svg({ className = 'h-5 w-5', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  )
}

export function FolderIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </Svg>
  )
}

export function FileIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </Svg>
  )
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  )
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M12 6 5 8l-2 5a3.5 3.5 0 0 0 7 0l-2-5" />
      <path d="M12 6l7 2 2 5a3.5 3.5 0 0 1-7 0l2-5" />
    </Svg>
  )
}

export function BookOpenIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 6c-1.5-1.5-3.8-2-6-2H4v15h2c2.2 0 4.5.5 6 2 1.5-1.5 3.8-2 6-2h2V4h-2c-2.2 0-4.5.5-6 2Z" />
      <path d="M12 6v15" />
    </Svg>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3 3.4-4.5 6.5-4.5s5.7 1.5 6.5 4.5" />
      <path d="M16 4.8a3.5 3.5 0 0 1 0 6.4" />
      <path d="M18.5 15.9c1.6.7 2.6 2 3 4.1" />
    </Svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Svg>
  )
}

export function TagIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z" />
      <circle cx="8" cy="8" r="1.6" />
    </Svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  )
}

export function ShareIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </Svg>
  )
}
