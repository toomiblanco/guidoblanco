import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name?: string | null
    role: 'admin' | 'user'
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: 'admin' | 'user'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    role: 'admin' | 'user'
  }
}
