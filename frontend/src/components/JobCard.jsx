import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function JobCard({ job }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-gray-800 text-sm">{job.title}</h3>
      <p className="text-gray-500 text-sm mt-0.5">{job.company}</p>
      {job.location && (
        <p className="text-gray-400 text-xs mt-1">{job.location}</p>
      )}
    </div>
  )
}

export default JobCard