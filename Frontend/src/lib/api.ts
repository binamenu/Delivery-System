import axios from 'axios'
import { API_BASE_URL, isAuthRequestUrl } from '@/lib/http'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (config.url) {
    config.url = config.url.replace(/\/+$/, '') || config.url
  }

  const requestUrl = String(config.url ?? '')
  if (isAuthRequestUrl(requestUrl) && requestUrl.includes('/register')) {
    const headers = config.headers
    if (headers && typeof headers.delete === 'function') {
      headers.delete('Authorization')
    } else {
      delete config.headers.Authorization
    }
    return config
  }

  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = String(error.config?.url ?? '')
    const method = String(error.config?.method ?? 'get').toLowerCase()
   const skipRedirect =
  isAuthRequestUrl(requestUrl) ||
  requestUrl.includes('/orders') ||
  requestUrl.includes('/profile') ||
  (method === 'get' && requestUrl.includes('/categories'))

    if (status === 401 && !skipRedirect) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
