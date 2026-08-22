import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

export async function addContact(jobId, contactData) {
  const res = await axios.post(`${API_BASE}/jobs/${jobId}/contacts`, contactData)
  return res.data
}

export async function deleteContact(contactId) {
  await axios.delete(`${API_BASE}/contacts/${contactId}`)
}