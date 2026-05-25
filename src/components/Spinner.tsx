type SpinnerProps = {
  className?: string
  size?: 'sm' | 'md'
}

export function Spinner({ className = '', size = 'sm' }: SpinnerProps) {
  const dim = size === 'md' ? 'h-6 w-6' : 'h-4 w-4'
  return (
    <span
      className={[
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        dim,
        className,
      ].join(' ')}
      aria-hidden
    />
  )
}
