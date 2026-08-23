import { useState } from 'react'
import { updateJob, deleteJob, generateColdEmail, generatePrepNotes } from '../api/jobs'
import { addContact, deleteContact } from '../api/contacts'
import CopyButton from './CopyButton'

const STATUS_OPTIONS = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

function JobDetailsModal({ job, onClose, onJobUpdated, onJobDeleted }) {
  const [form, setForm] = useState({
    company: job.company,
    title: job.title,
    location: job.location || '',
    job_url: job.job_url || '',
    job_description: job.job_description || '',
    status: job.status,
    notes: job.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [contacts, setContacts] = useState(job.contacts || [])
  const [newContact, setNewContact] = useState({ name: '', role: '', email: '' })
  const [error, setError] = useState(null)
  const [generatedEmail, setGeneratedEmail] = useState(job.generated_email || null)
  const [generatedPrep, setGeneratedPrep] = useState(job.generated_prep || null)
  const [generatingEmail, setGeneratingEmail] = useState(false)
  const [generatingPrep, setGeneratingPrep] = useState(false)
  const [activeAiTab, setActiveAiTab] = useState('email')

  if (!job) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)
      const updated = await updateJob(job.id, form)
      onJobUpdated({ ...updated, contacts })
      onClose()
    } catch (err) {
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${job.title}" at ${job.company}? This cannot be undone.`)) return
    try {
      await deleteJob(job.id)
      onJobDeleted(job.id)
      onClose()
    } catch (err) {
      setError('Could not delete job.')
    }
  }

  async function handleAddContact(e) {
    e.preventDefault()
    if (!newContact.name.trim()) return
    try {
      const created = await addContact(job.id, newContact)
      setContacts((prev) => [...prev, created])
      setNewContact({ name: '', role: '', email: '' })
    } catch (err) {
      setError('Could not add contact.')
    }
  }

  async function handleDeleteContact(contactId) {
    try {
      await deleteContact(contactId)
      setContacts((prev) => prev.filter((c) => c.id !== contactId))
    } catch (err) {
      setError('Could not remove contact.')
    }
  }

    async function handleGenerateEmail() {
    try {
      setGeneratingEmail(true)
      setError(null)
      const updated = await generateColdEmail(job.id)
      setGeneratedEmail(updated.generated_email)
      onJobUpdated({ ...updated, contacts })
    } catch (err) {
      setError('Could not generate email. Check your Gemini API key and try again.')
    } finally {
      setGeneratingEmail(false)
    }
  }

  async function handleGeneratePrep() {
    try {
      setGeneratingPrep(true)
      setError(null)
      const updated = await generatePrepNotes(job.id)
      setGeneratedPrep(updated.generated_prep)
      onJobUpdated({ ...updated, contacts })
    } catch (err) {
      setError('Could not generate prep notes. Check your Gemini API key and try again.')
    } finally {
      setGeneratingPrep(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Job Details</h2>
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

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Job Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Interview notes, follow-up reminders, etc."
            />
          </div>

          <div className="border-t border-gray-200 pt-3 mt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Contacts</h3>

            {contacts.length > 0 && (
              <div className="space-y-2 mb-3">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-700">{c.name}</span>
                      {c.role && <span className="text-gray-400"> — {c.role}</span>}
                      {c.email && <div className="text-gray-400 text-xs">{c.email}</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddContact} className="flex gap-2">
              <input
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                placeholder="Role"
                value={newContact.role}
                onChange={(e) => setNewContact((p) => ({ ...p, role: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                placeholder="Email"
                value={newContact.email}
                onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Add
              </button>
                        </form>
          </div>

          {/* AI Generation section */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setActiveAiTab('email')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  activeAiTab === 'email'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                Cold Email
              </button>
              <button
                onClick={() => setActiveAiTab('prep')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  activeAiTab === 'prep'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                Interview Prep
              </button>
            </div>

            {activeAiTab === 'email' && (
              <div>
                <button
                  onClick={handleGenerateEmail}
                  disabled={generatingEmail}
                  className="text-sm bg-violet-600 text-white px-3 py-1.5 rounded-md hover:bg-violet-700 disabled:opacity-50"
                >
                  {generatingEmail
                    ? 'Generating...'
                    : generatedEmail
                    ? 'Regenerate Email'
                    : 'Generate Cold Email'}
                </button>
                                    {generatedEmail && (
                  <div className="mt-2">
                    <div className="flex justify-end mb-1">
                      <CopyButton text={generatedEmail} />
                    </div>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 border border-gray-200 rounded-md p-3 font-sans">
                      {generatedEmail}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeAiTab === 'prep' && (
              <div>
                <button
                  onClick={handleGeneratePrep}
                  disabled={generatingPrep}
                  className="text-sm bg-violet-600 text-white px-3 py-1.5 rounded-md hover:bg-violet-700 disabled:opacity-50"
                >
                  {generatingPrep
                    ? 'Generating...'
                    : generatedPrep
                    ? 'Regenerate Prep Notes'
                    : 'Generate Prep Notes'}
                </button>
                                    {generatedPrep && (
                  <div className="mt-2">
                    <div className="flex justify-end mb-1">
                      <CopyButton text={generatedPrep} />
                    </div>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 border border-gray-200 rounded-md p-3 font-sans">
                      {generatedPrep}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              Delete Job
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetailsModal