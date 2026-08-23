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
import JobDetailsModal from './JobDetailsModal'
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
  const [selectedJob, setSelectedJob] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  function handleJobCreated(newJob) {
    setJobs((prev) => [newJob, ...prev])
  }

  function handleJobUpdated(updatedJob) {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)))
  }

  function handleJobDeleted(jobId) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  useEffect(() => {
    // Debounce: wait 300ms after the user stops typing before calling the API
    const timeout = setTimeout(() => {
      loadJobs(searchTerm)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  async function loadJobs(search = '') {
    try {
      setLoading(true)
      const data = await fetchJobs(search ? { search } : {})
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

  return (
    <div>
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Add Job
        </button>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by company or title..."
          className="flex-1 max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {loading && jobs.length === 0 ? (
        <p className="text-gray-400 mt-8">Loading jobs...</p>
      ) : (
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
                onCardClick={setSelectedJob}
              />
            ))}
          </div>
        </DndContext>
      )}

      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobCreated={handleJobCreated}
      />

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onJobUpdated={handleJobUpdated}
          onJobDeleted={handleJobDeleted}
        />
      )}
    </div>
  )
}

export default KanbanBoard