type Props = {
  icon?: string
  title: string
  description: string
  compact?: boolean
}

export function MasterEmptyState({
  icon = '✦',
  title,
  description,
  compact = false,
}: Props) {
  return (
    <div className={compact ? 'master-empty-compact' : 'master-empty'}>
      <span className="master-empty-icon" aria-hidden>
        {icon}
      </span>
      <p className="master-empty-title">{title}</p>
      <p className="master-empty-desc">{description}</p>
    </div>
  )
}
