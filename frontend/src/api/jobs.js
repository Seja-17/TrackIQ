import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

export async function fetchJobs(params = {}) {
  const res = await axios.get(`${API_BASE}/jobs`, { params })
  return res.data
}

export async function createJob(jobData) {
  const res = await axios.post(`${API_BASE}/jobs`, jobData)
  return res.data
}

export async function updateJob(jobId, updates) {
  const res = await axios.patch(`${API_BASE}/jobs/${jobId}`, updates)
  return res.data
}

export async function deleteJob(jobId) {
  await axios.delete(`${API_BASE}/jobs/${jobId}`)
}
export async function generateColdEmail(jobId) {
  const res = await axios.post(`${API_BASE}/jobs/${jobId}/generate-email`)
  return res.data
}

export async function generatePrepNotes(jobId) {
  const res = await axios.post(`${API_BASE}/jobs/${jobId}/generate-prep`)
  return res.data
}