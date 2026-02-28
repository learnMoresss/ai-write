import { defineStore } from 'pinia'

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && state.isAuthenticated,
    currentUser: (state) => state.user
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const { supabase } = await import('~/composables/useAuth')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        if (data?.user) {
          this.setUser(data.user)
          return { success: true, user: this.user }
        }

        return { success: false, error: 'No user returned from authentication' }
      } catch (error: any) {
        console.error('Login error:', error)
        return { success: false, error: error.message || 'Login failed' }
      } finally {
        this.isLoading = false
      }
    },

    async register(email: string, password: string, name?: string) {
      this.isLoading = true
      try {
        const { supabase } = await import('~/composables/useAuth')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name
            }
          }
        })

        if (error) throw error

        if (data?.user) {
          this.setUser(data.user)
          return { success: true, user: this.user }
        }

        return { success: false, error: 'No user returned from registration' }
      } catch (error: any) {
        console.error('Registration error:', error)
        return { success: false, error: error.message || 'Registration failed' }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        const { supabase } = await import('~/composables/useAuth')
        const { error } = await supabase.auth.signOut()

        if (error) throw error

        this.clearUser()
        return { success: true }
      } catch (error: any) {
        console.error('Logout error:', error)
        return { success: false, error: error.message || 'Logout failed' }
      } finally {
        this.isLoading = false
      }
    },

    async refreshSession() {
      this.isLoading = true
      try {
        const { supabase } = await import('~/composables/useAuth')
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (data?.session?.user) {
          this.setUser(data.session.user)
        } else {
          this.clearUser()
        }
      } catch (error: any) {
        console.error('Session refresh error:', error)
        this.clearUser()
      } finally {
        this.isLoading = false
      }
    },

    setUser(userData: any) {
      this.user = {
        id: userData.id,
        email: userData.email || '',
        name: userData.user_metadata?.name || userData.name || '',
        avatar: userData.user_metadata?.avatar || userData.avatar
      }
      this.isAuthenticated = true
    },

    clearUser() {
      this.user = null
      this.isAuthenticated = false
    }
  }
})