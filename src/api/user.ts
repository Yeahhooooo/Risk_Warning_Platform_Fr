import request from '@/utils/request'
import type { LoginRequest, RegisterRequest, LoginResponse, UserResponse, Result } from '@/types'

// 用户登录
export function login(data: LoginRequest): Promise<Result<LoginResponse>> {
  return request.post('/user/login', data)
}

// 用户注册
export function register(data: RegisterRequest): Promise<Result<UserResponse>> {
  return request.post('/user/register', data)
}

// 获取当前用户信息
export function getCurrentUser(): Promise<Result<UserResponse>> {
  return request.get('/user/profile')
}

// 更新用户信息
export function updateProfile(data: Partial<UserResponse>): Promise<Result<UserResponse>> {
  return request.put('/user/profile', data)
}

