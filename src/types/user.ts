/**
 * 用户相关类型定义
 */

// 注册请求参数
export interface RegisterParams {
  email: string;
  password: string;
  name: string;
}

// 注册响应
export interface RegisterResponse {
  state: string;
  UUID: string;
  email: string;
  name: string;
  createdat: string;
}

// 登录请求参数
export interface LoginParams {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  state: string;
  token: string;
  expiresIn: number;
  UUID: string;
}

// 更新用户信息请求参数
export interface UpdateUserParams {
  email?: string;
  password?: string;
  name?: string;
}

// 更新用户信息响应
export interface UpdateUserResponse {
  state: string;
  UUID: string;
  email: string;
  name: string;
}

// 用户信息响应
export interface UserInfoResponse {
  UUID: string;
  name: string;
  email: string;
  balance: number;
  createdat: string;
}

// 通用成功响应
export interface SuccessResponse {
  state: string;
}

// 忘记密码请求参数
export interface ForgetPasswordParams {
  email: string;
} 