/**
 * User related type definitions
 */

// Register request parameters
export interface RegisterParams {
  email: string;
  password: string;
  name: string;
}

// Register response
export interface RegisterResponse {
  state: string;
  UUID: string;
  email: string;
  name: string;
  createdat: string;
}

// Login request parameters
export interface LoginParams {
  email: string;
  password: string;
}

// Login response
export interface LoginResponse {
  state: string;
  token: string;
  expiresIn: number;
  UUID: string;
}

// User information response
export interface UserInfoResponse {
  UUID: string;
  name: string;
  email: string;
  balance: number;
  createdat: string;
}

// Update user request parameters
export interface UpdateUserParams {
  email?: string;
  password?: string;
  name?: string;
}

// Update user response
export interface UpdateUserResponse {
  state: string;
  UUID: string;
  email: string;
  name: string;
}

// Forget password request parameters
export interface ForgetPasswordParams {
  email: string;
}

// Common success response
export interface SuccessResponse {
  state: string;
}
