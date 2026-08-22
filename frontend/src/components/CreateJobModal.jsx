import { useState } from 'react'
import { createJob } from '../api/jobs'

const STATUS_OPTIONS = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
]

function CreateJobModal({ isOpen, onClose, onJobCreated }) {
  const [form, setForm] = useState({
    company: '',
    title: '',
    location: '',
    job_url: '',
    job_description: '',
    status: 'APPLIED',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.company.trim() || !form.title.trim()) {
      setError('Company and title are required.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const newJob = await createJob(form)
      onJobCreated(newJob)
      setForm({
        company: '',
        title: '',
        location: '',
        job_url: '',
        job_description: '',
        status: 'APPLIED',
      })
      onClose()
    } catch (err) {
      setError('Could not create job. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Add New Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-200 rounded-md p-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Company *</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Google"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Job Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Bangalore, India"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Job URL</label>
            <input
              name="job_url"
              value={form.job_url}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Job Description</label>
            <textarea
              name="job_description"
              value={form.job_description}
              onChange={handleChange}
              rows={4}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Paste the job description here — this will power AI email generation later."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateJobModal