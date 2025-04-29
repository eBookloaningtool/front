import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: false,
    token: null,
    uuid: null,
    userName: null,
    userEmail: null,
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
        email: state.userEmail
      }
    }
  },

  actions: {
    // 初始化用户状态（从localStorage恢复）
    initUserState() {
      const token = localStorage.getItem('token')
      const uuid = localStorage.getItem('uuid')
      const userName = localStorage.getItem('userName')
      const userEmail = localStorage.getItem('registeredEmail') // 使用注册时保存的email

      if (token) {
        this.isAuthenticated = true
        this.token = token
        this.uuid = uuid
        this.userName = userName
        this.userEmail = userEmail
      }
    },

    // 设置用户登录状态
    login(userData) {
      this.isAuthenticated = true
      this.token = userData.token
      this.uuid = userData.UUID

      // 保存到 localStorage 以便刷新页面后恢复状态
      localStorage.setItem('token', userData.token)
      localStorage.setItem('uuid', userData.UUID)

      // 如果有其他用户信息也保存
      if (userData.name) {
        this.userName = userData.name
        localStorage.setItem('userName', userData.name)
      }

      if (userData.email) {
        this.userEmail = userData.email
        localStorage.setItem('registeredEmail', userData.email)
      }
    },

    // 用户登出
    logout() {
      this.isAuthenticated = false
      this.token = null
      this.uuid = null
      this.userName = null
      this.userEmail = null

      // 清除 localStorage 中的登录信息
      localStorage.removeItem('token')
      localStorage.removeItem('uuid')
      // 不删除用户名和邮箱以便下次登录时自动填充
    }
  }
})

