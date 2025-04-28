/**
 * 用户管理相关接口
 */

// 引入请求方法
import { post } from '../utils/request.ts';
import { 
  RegisterParams,
  RegisterResponse,
  UpdateUserParams,
  UpdateUserResponse,
  UserInfoResponse,
  SuccessResponse
} from '../types/user.ts';

// 接口地址枚举
enum URL {
  REGISTER = '/api/users/register',
  UPDATE = '/api/users/update',
  INFO = '/api/users/info',
  DELETE = '/api/users/delete'
}

/**
 * 用户注册
 * @param data 注册信息 {email, password, name}
 * @returns Promise 返回注册结果
 */
export async function registerUser(data: RegisterParams): Promise<RegisterResponse> {
  return post({
    url: URL.REGISTER,
    data
  });
}

/**
 * 更新用户信息
 * 需要 Authorization 头
 * @param data 更新的用户信息 {email?, password?, name?}
 * @returns Promise 返回更新结果
 */
export async function updateUser(data: UpdateUserParams): Promise<UpdateUserResponse> {
  return post({
    url: URL.UPDATE,
    data
  });
}

/**
 * 获取用户信息
 * 需要 Authorization 头
 * @returns Promise 返回用户信息
 */
export async function getUserInfo(): Promise<UserInfoResponse> {
  return post({
    url: URL.INFO
  });
}

/**
 * 删除账号
 * 需要 Authorization 头
 * @returns Promise 返回删除结果
 */
export async function deleteUser(): Promise<SuccessResponse> {
  return post({
    url: URL.DELETE
  });
}