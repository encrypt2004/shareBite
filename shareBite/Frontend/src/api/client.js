import axios from 'axios'

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/sharebite-521de/us-central1/api'

const client = axios.create({
  baseURL,
  withCredentials: false,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { client }
