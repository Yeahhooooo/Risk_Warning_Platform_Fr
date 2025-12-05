// API响应类型
export interface Result<T> {
  code: number
  message: string
  data: T
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求
export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

// 用户响应
export interface UserResponse {
  id: number
  email: string
  fullName: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

// 登录响应
export interface LoginResponse {
  token: string
  tokenType: string
  user: UserResponse
}

