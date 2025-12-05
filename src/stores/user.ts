import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserResponse } from '@/types'
import { login as loginApi, register as registerApi, getCurrentUser } from '@/api/user'
import type { LoginRequest, RegisterRequest } from '@/types'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserResponse | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  // 初始化用户信息
  const initUser = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user.value = JSON.parse(userStr)
    }
  }

  // 登录
  const login = async (loginData: LoginRequest) => {
    const res = await loginApi(loginData)
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    return res
  }

  // 注册
  const register = async (registerData: RegisterRequest) => {
    const res = await registerApi(registerData)
    return res
  }

  // 获取用户信息
  const fetchUser = async () => {
    const res = await getCurrentUser()
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    return res
  }

  // 退出登录
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // 初始化
  initUser()

  return {
    user,
    token,
    login,
    register,
    fetchUser,
    logout
  }
})

