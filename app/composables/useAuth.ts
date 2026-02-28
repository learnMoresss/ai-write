import { createClient } from '@supabase/supabase-js'

// 环境变量检查
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Authentication will not work properly.')
}

// 初始化 Supabase 客户端
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: { message: 'Supabase not configured' } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null })
      }
    }

/**
 * 使用 Supabase 认证服务
 */
export function useAuth() {
  const authStore = useAuthStore()

  /**
   * 登录用户
   */
  const login = async (email: string, password: string) => {
    return await authStore.login(email, password)
  }

  /**
   * 注册新用户
   */
  const register = async (email: string, password: string, name?: string) => {
    return await authStore.register(email, password, name)
  }

  /**
   * 登出用户
   */
  const logout = async () => {
    return await authStore.logout()
  }

  /**
   * 获取当前会话
   */
  const getCurrentSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      return data.session
    } catch (error: any) {
      console.error('Error getting session:', error)
      return null
    }
  }

  /**
   * 监听认证状态变化
   */
  const listenAuthState = () => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        authStore.setUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        authStore.clearUser()
      } else if (event === 'USER_UPDATED' && session?.user) {
        authStore.setUser(session.user)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        authStore.setUser(session.user)
      }
    })

    // 返回取消监听函数
    return () => {
      authListener.subscription.unsubscribe()
    }
  }

  return {
    login,
    register,
    logout,
    getCurrentSession,
    listenAuthState,
    supabase
  }
}