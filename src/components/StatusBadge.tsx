import type { VisitStatus } from '@/types/models'
import { statusBadgeClass, statusLabelRu } from '@/utils/visitStatus'

type Props = {
  status: VisitStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={statusBadgeClass(status)}>
      <span className="badge-dot" aria-hidden />
      {statusLabelRu(status)}
    </span>
  )
}
