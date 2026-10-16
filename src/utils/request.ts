import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { Result } from '@/types'
import { ElMessage } from 'element-plus'
import router from '@/router'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Polling errors are displayed persistently by the page instead of repeated toasts. */
    silent?: boolean
  }
}

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      // token 已经包含 "Bearer " 前缀，直接使用
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<Result<unknown>>) => {
    const { code, message } = response.data
    if (code === 200) {
      return response.data as unknown as AxiosResponse
    } else {
      if (!response.config.silent) ElMessage.error(message || '请求失败')
      return Promise.reject(Object.assign(new Error(message || '请求失败'), { code, data: response.data.data }))
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        router.push('/login')
        ElMessage.error('登录已过期，请重新登录')
      } else {
        if (!error.config?.silent) ElMessage.error(data?.message || '请求失败')
      }
    } else {
      if (!error.config?.silent) ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request

