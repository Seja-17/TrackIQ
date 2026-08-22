import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import JobCard from './JobCard'

const STATUS_COLORS = {
  WISHLIST: 'bg-gray-200 text-gray-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  INTERVIEWING: 'bg-amber-100 text-amber-700',
  OFFER: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
}

function KanbanColumn({ status, label, jobs, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`w-72 flex-shrink-0 rounded-xl p-3 ${
        isOver ? 'bg-indigo-50' : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[status]}`}
        >
          {label}
        </span>
        <span className="text-xs text-gray-400">{jobs.length}</span>
      </div>

      <SortableContext
        items={jobs.map((j) => j.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[60px]">
        {jobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default KanbanColumn