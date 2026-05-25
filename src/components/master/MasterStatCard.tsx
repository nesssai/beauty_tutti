type MasterStatCardProps = {
  label: string
  value: number | string
  icon: string
  accent?: 'rose' | 'gold' | 'lavender' | 'emerald' | 'slate'
}

const accentClass: Record<NonNullable<MasterStatCardProps['accent']>, string> = {
  rose: 'master-stat-rose',
  gold: 'master-stat-gold',
  lavender: 'master-stat-lavender',
  emerald: 'master-stat-emerald',
  slate: 'master-stat-slate',
}

export function MasterStatCard({
  label,
  value,
  icon,
  accent = 'rose',
}: MasterStatCardProps) {
  return (
    <div className={`master-stat-card ${accentClass[accent]}`}>
      <div className="master-stat-icon" aria-hidden>
        {icon}
      </div>
      <div>
        <p className="master-stat-value">{value}</p>
        <p className="master-stat-label">{label}</p>
      </div>
    </div>
  )
}
