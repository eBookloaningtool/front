import { defineStore } from 'pinia'
import { userAPI } from '../services/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: false,
    token: null,
    uuid: null,
    userName: null,
    userEmail: null,
    balance: 0,
    createdAt: null
  }),

  getters: {
    // 获取用户认证状态
    getIsAuthenticated(state) {
      return state.isAuthenticated
    },
    // 获取用户信息
    getUserInfo(state) {
      return {
        uuid: state.uuid,
        name: state.userName,
        email: state.userEmail,
        balance: state.balance,
        createdAt: state.createdAt
      }
    }
  },

  actions: {
    // 初始化用户状态（从localStorage恢复）
    async initUserState() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // 验证token并获取用户信息
          const response = await userAPI.getUserInfo()
          if (response.data) {
            this.isAuthenticated = true
            this.token = token
            this.uuid = response.data.UUID
            this.userName = response.data.name
            this.userEmail = response.data.email
            this.balance = response.data.balance
            this.createdAt = response.data.createdat
          } else {
            // token无效，清除本地存储
            this.logout()
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          this.logout()
        }
      } else {
        // 如果没有token，确保状态被清除
        this.isAuthenticated = false
        this.token = null
        this.uuid = null
        this.userName = null
        this.userEmail = null
        this.balance = 0
        this.createdAt = null
      }
    },

    // 设置用户登录状态
    async login(userData) {
      try {
        const response = await userAPI.login(userData)
        if (response.data.state === 'success') {
          this.isAuthenticated = true
          this.token = response.data.token
          this.uuid = response.data.UUID

          // 保存到 localStorage
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('uuid', response.data.UUID)

          // 获取并保存用户详细信息
          const userInfo = await userAPI.getUserInfo()
          if (userInfo.data) {
            this.userName = userInfo.data.name
            this.userEmail = userInfo.data.email
            this.balance = userInfo.data.balance
            this.createdAt = userInfo.data.createdat
            localStorage.setItem('userName', userInfo.data.name)
            localStorage.setItem('registeredEmail', userInfo.data.email)
          }
        }
        return response.data
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    // 用户登出
    async logout() {
      try {
        await userAPI.logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.isAuthenticated = false
        this.token = null
        this.uuid = null
        this.userName = null
        this.userEmail = null
        this.balance = 0
        this.createdAt = null

        // 清除 localStorage 中的登录信息
        localStorage.removeItem('token')
        localStorage.removeItem('uuid')
        localStorage.removeItem('userName')
        localStorage.removeItem('registeredEmail')
      }
    },

    // 更新用户信息
    async updateUserInfo(userData) {
      try {
        const response = await userAPI.updateUserInfo(userData)
        if (response.data.state === 'success') {
          this.userName = response.data.name
          this.userEmail = response.data.email
          localStorage.setItem('userName', response.data.name)
          localStorage.setItem('registeredEmail', response.data.email)
        }
        return response.data
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    },

    // 删除账号
    async deleteAccount() {
      try {
        const response = await userAPI.deleteAccount()
        if (response.data.state === 'success') {
          this.logout()
        }
        return response.data
      } catch (error) {
        console.error('删除账号失败:', error)
        throw error
      }
    }
  }
})
