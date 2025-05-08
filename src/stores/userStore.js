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
    // Get user authentication status
    getIsAuthenticated(state) {
      return state.isAuthenticated
    },
    // Get user information
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
    // Initialize user state (restore from localStorage)
    async initUserState() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Verify token and get user information
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
            // Invalid token, clear localStorage
            this.logout()
          }
        } catch (error) {
          console.error('Failed to get user information:', error)
          this.logout()
        }
      } else {
        // If there is no token, ensure the state is cleared
        this.isAuthenticated = false
        this.token = null
        this.uuid = null
        this.userName = null
        this.userEmail = null
        this.balance = 0
        this.createdAt = null
      }
    },

    // Set user login status
    async login(userData) {
      try {
        const response = await userAPI.login(userData)
        if (response.data.state === 'success') {
          this.isAuthenticated = true
          this.token = response.data.token
          this.uuid = response.data.UUID

          // Save to localStorage
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('uuid', response.data.UUID)

          // Get and save user detailed information
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

    // User logout
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

        // Clear login information in localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('uuid')
        localStorage.removeItem('userName')
        localStorage.removeItem('registeredEmail')
      }
    },

    // Update user information
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

    // Delete account
    async deleteAccount() {
      try {
        const response = await userAPI.deleteAccount()
        if (response.data.state === 'success') {
          this.logout()
        }
        return response.data
      } catch (error) {
        console.error('Failed to delete account:', error)
        throw error
      }
    }
  }
})
