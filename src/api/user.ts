/**
 * User management related interfaces
 */

// Import request method
import { post } from '../utils/request.ts';
import {
  RegisterParams,
  RegisterResponse,
  UpdateUserParams,
  UpdateUserResponse,
  UserInfoResponse,
  SuccessResponse
} from '../types/user.ts';

// Interface address enumeration
enum URL {
  REGISTER = '/api/users/register',
  UPDATE = '/api/users/update',
  INFO = '/api/users/info',
  DELETE = '/api/users/delete'
}

/**
 * Register
 * @param data Register information {email, password, name}
 * @returns Promise Return registration result
 */
export async function registerUser(data: RegisterParams): Promise<RegisterResponse> {
  return post({
    url: URL.REGISTER,
    data
  });
}

/**
 * Update user information
 * Requires Authorization header
 * @param data Updated user information {email?, password?, name?}
 * @returns Promise Return update result
 */
export async function updateUser(data: UpdateUserParams): Promise<UpdateUserResponse> {
  return post({
    url: URL.UPDATE,
    data
  });
}

/**
 * Get user information
 * Requires Authorization header
 * @returns Promise Return user information
 */
export async function getUserInfo(): Promise<UserInfoResponse> {
  return post({
    url: URL.INFO
  });
}

/**
 * Delete account
 * Requires Authorization header
 * @returns Promise Return delete result
 */
export async function deleteUser(): Promise<SuccessResponse> {
  return post({
    url: URL.DELETE
  });
}
