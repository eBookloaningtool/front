import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: false,
    token: null,
    uuid: null,
    userName: null,
    userEmail: null,
    avatarUrl: null,
    balance: 0,
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
        avatarUrl: state.avatarUrl,
        balance: state.balance
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
      const avatarUrl = localStorage.getItem('userAvatarUrl') // 从localStorage获取头像URL
      const balance = localStorage.getItem('userBalance') // 获取余额

      if (token) {
        this.isAuthenticated = true
        this.token = token
        this.uuid = uuid
        this.userName = userName
        this.userEmail = userEmail
        this.avatarUrl = avatarUrl || this.generateAvatarUrl(uuid) // 如果有存储的头像则使用，否则重新生成
        this.balance = balance ? parseFloat(balance) : 0 // 解析余额
      }
    },

    // 生成固定的头像URL
    generateAvatarUrl(userId) {
      if (!userId) return null

      // 确保UUID有效
      const id = typeof userId === 'string' ? userId : this.uuid
      if (!id) return null

      // 使用UUID的前8个字符作为种子，确保生成一致的颜色
      const seed = id.substring(0, 8)
      let hash = 0
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash)
      }

      // 生成固定的背景色
      let color = Math.abs(hash).toString(16).substring(0, 6)
      while (color.length < 6) {
        color += '0'
      }

      const name = this.userName || 'User'
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

      // 生成最终头像URL
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff`

      // 保存头像URL到localStorage
      localStorage.setItem('userAvatarUrl', avatarUrl)

      return avatarUrl
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

      // 设置初始余额（如果没有）
      if (!localStorage.getItem('userBalance')) {
        localStorage.setItem('userBalance', '0.00')
        this.balance = 0
      } else {
        this.balance = parseFloat(localStorage.getItem('userBalance'))
      }

      // 生成并保存头像URL
      this.avatarUrl = this.generateAvatarUrl(userData.UUID)
    },

    // 更新用户余额
    updateBalance(newBalance) {
      this.balance = newBalance
      localStorage.setItem('userBalance', newBalance.toString())
    },

    // 用户登出
    logout() {
      this.isAuthenticated = false
      this.token = null
      this.uuid = null
      this.userName = null
      this.userEmail = null
      this.avatarUrl = null
      this.balance = 0

      // 清除 localStorage 中的登录信息
      localStorage.removeItem('token')
      localStorage.removeItem('uuid')
      localStorage.removeItem('userAvatarUrl')
      // 不删除用户名和邮箱以便下次登录时自动填充
    }
  }
})

