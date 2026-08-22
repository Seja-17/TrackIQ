import { useEffect, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import CreateJobModal from './CreateJobModal'
import { fetchJobs, updateJob } from '../api/jobs'

const COLUMNS = [
  { status: 'WISHLIST', label: 'Wishlist' },
  { status: 'APPLIED', label: 'Applied' },
  { status: 'INTERVIEWING', label: 'Interviewing' },
  { status: 'OFFER', label: 'Offer' },
  { status: 'REJECTED', label: 'Rejected' },
]

function KanbanBoard() {
    const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleJobCreated(newJob) {
    setJobs((prev) => [newJob, ...prev])
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    try {
      setLoading(true)
      const data = await fetchJobs()
      setJobs(data)
      setError(null)
    } catch (err) {
      setError('Could not load jobs. Is the backend running on port 8000?')
    } finally {
      setLoading(false)
    }
  }

  function jobsForStatus(status) {
    return jobs.filter((job) => job.status === status)
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const jobId = active.id
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    const targetStatus = COLUMNS.some((c) => c.status === over.id)
      ? over.id
      : jobs.find((j) => j.id === over.id)?.status

    if (!targetStatus || targetStatus === job.status) return

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: targetStatus } : j))
    )

    try {
      await updateJob(jobId, { status: targetStatus })
    } catch (err) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: job.status } : j))
      )
    }
  }

  if (loading) {
    return <p className="text-gray-400 mt-8">Loading jobs...</p>
  }

  if (error) {
    return <p className="text-red-500 mt-8">{error}</p>
  }

    return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-6 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        + Add Job
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 mt-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              jobs={jobsForStatus(col.status)}
            />
          ))}
        </div>
      </DndContext>

      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  )
}

export default KanbanBoard