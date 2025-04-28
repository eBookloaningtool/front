import * as React from 'react';
import { useState, useEffect } from 'react';
import { registerUser, updateUser, getUserInfo, deleteUser } from '../api/user';
import { loginUser, logout, forgetPassword } from '../api/auth';
import { RegisterParams, LoginParams, UpdateUserParams, ForgetPasswordParams } from '../types/user';

const UserExample: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // 注册用户示例
  const handleRegister = async () => {
    try {
      const registerData: RegisterParams = {
        email: 'user@example.com',
        password: 'securepassword',
        name: 'John Doe'
      };
      
      const response = await registerUser(registerData);
      console.log('注册成功:', response);
    } catch (error) {
      console.error('注册失败:', error);
    }
  };
  
  // 登录示例
  const handleLogin = async () => {
    try {
      const loginData: LoginParams = {
        email: 'user@example.com',
        password: 'securepassword'
      };
      
      const response = await loginUser(loginData);
      console.log('登录成功:', response);
      
      // 保存token到localStorage
      localStorage.setItem('token', response.token);
    } catch (error) {
      console.error('登录失败:', error);
    }
  };
  
  // 获取用户信息示例
  const handleGetUserInfo = async () => {
    try {
      const userInfo = await getUserInfo();
      setUserInfo(userInfo);
      console.log('用户信息:', userInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };
  
  // 更新用户信息示例
  const handleUpdateUser = async () => {
    try {
      const updateData: UpdateUserParams = {
        name: 'Updated Name'
      };
      
      const response = await updateUser(updateData);
      console.log('更新成功:', response);
    } catch (error) {
      console.error('更新失败:', error);
    }
  };
  
  // 注销示例
  const handleLogout = async () => {
    try {
      const response = await logout();
      console.log('注销成功:', response);
      
      // 清除本地token
      localStorage.removeItem('token');
      setUserInfo(null);
    } catch (error) {
      console.error('注销失败:', error);
    }
  };
  
  // 忘记密码示例
  const handleForgetPassword = async () => {
    try {
      const forgetData: ForgetPasswordParams = {
        email: 'user@example.com'
      };
      
      const response = await forgetPassword(forgetData);
      console.log('密码重置请求已发送:', response);
    } catch (error) {
      console.error('密码重置请求失败:', error);
    }
  };
  
  // 删除账号示例
  const handleDeleteAccount = async () => {
    try {
      const response = await deleteUser();
      console.log('账号删除成功:', response);
      
      // 清除本地token
      localStorage.removeItem('token');
      setUserInfo(null);
    } catch (error) {
      console.error('账号删除失败:', error);
    }
  };
  
  return (
    <div className="user-example">
      <h2>用户操作示例</h2>
      
      <div className="buttons">
        <button onClick={handleRegister}>注册</button>
        <button onClick={handleLogin}>登录</button>
        <button onClick={handleGetUserInfo}>获取用户信息</button>
        <button onClick={handleUpdateUser}>更新用户信息</button>
        <button onClick={handleLogout}>注销</button>
        <button onClick={handleForgetPassword}>忘记密码</button>
        <button onClick={handleDeleteAccount}>删除账号</button>
      </div>
      
      {userInfo && (
        <div className="user-info">
          <h3>用户信息</h3>
          <p>UUID: {userInfo.UUID}</p>
          <p>名称: {userInfo.name}</p>
          <p>邮箱: {userInfo.email}</p>
          <p>余额: {userInfo.balance}</p>
          <p>创建时间: {userInfo.createdat}</p>
        </div>
      )}
    </div>
  );
};

export default UserExample; 