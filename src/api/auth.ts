/**
 * 认证相关接口
 */

// 引入请求方法
import { post } from '../utils/request.ts';
import { 
  LoginParams,
  LoginResponse,
  ForgetPasswordParams,
  SuccessResponse
} from '../types/user.ts';

// 接口地址枚举
enum URL {
  LOGIN = '/api/auth/login',
  LOGOUT = '/api/auth/logout',
  FORGET = '/api/auth/forget'
}

/**
 * 用户登录
 * @param data 登录信息 {email, password}
 * @returns Promise 返回登录结果 {state, token, expiresIn, UUID}
 */
export async function loginUser(data: LoginParams): Promise<LoginResponse> {
  return post({
    url: URL.LOGIN,
    data
  });
}

/**
 * 用户注销
 * 需要 Authorization 头
 * @returns Promise 返回注销结果 {state}
 */
export async function logout(): Promise<SuccessResponse> {
  return post({
    url: URL.LOGOUT
  });
}

/**
 * 忘记密码
 * @param data 用户邮箱 {email}
 * @returns Promise 返回操作结果 {state}
 */
export async function forgetPassword(data: ForgetPasswordParams): Promise<SuccessResponse> {
  return post({
    url: URL.FORGET,
    data
  });
}