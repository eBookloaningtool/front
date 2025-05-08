/**
 * Authentication related interfaces
 */

// Import request method
import { post } from '../utils/request.ts';
import {
  LoginParams,
  LoginResponse,
  ForgetPasswordParams,
  SuccessResponse
} from '../types/user.ts';

// Interface address enumeration
enum URL {
  LOGIN = '/api/auth/login',
  LOGOUT = '/api/auth/logout',
  FORGET = '/api/auth/forget'
}

/**
 * User login
 * @param data Login information {email, password}
 * @returns Promise Return login result {state, token, expiresIn, UUID}
 */
export async function loginUser(data: LoginParams): Promise<LoginResponse> {
  return post({
    url: URL.LOGIN,
    data
  });
}

/**
 * User logout
 * Requires Authorization header
 * @returns Promise Return logout result {state}
 */
export async function logout(): Promise<SuccessResponse> {
  return post({
    url: URL.LOGOUT
  });
}

/**
 * Forget password
 * @param data User email {email}
 * @returns Promise Return operation result {state}
 */
export async function forgetPassword(data: ForgetPasswordParams): Promise<SuccessResponse> {
  return post({
    url: URL.FORGET,
    data
  });
}
