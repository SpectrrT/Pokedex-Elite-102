interface PokeballProps {
  size?: number
  className?: string
}

/** Decorative Poké Ball mark used in the header (matches public/favicon.svg). */
export function Pokeball({ size = 28, className }: PokeballProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="30" fill="#dc0a2d" />
      <path d="M2 32a30 30 0 0 0 60 0Z" fill="#f5f5f5" />
      <path d="M2 32h60" stroke="#1f1f1f" strokeWidth="6" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#1f1f1f" strokeWidth="4" />
      <circle cx="32" cy="32" r="10" fill="#f5f5f5" stroke="#1f1f1f" strokeWidth="4" />
      <circle cx="32" cy="32" r="4" fill="#1f1f1f" />
    </svg>
  )
}
