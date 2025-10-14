import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/database/connection'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          console.log("🔍 Buscando usuario:", credentials.email)

          // Buscar usuario en la base de datos
          const result = await query(
            'SELECT id, email, password_hash, full_name, is_admin FROM users WHERE email = $1',
            [credentials.email]
          )

          const user = result.rows[0]

          if (!user) {
            console.log("❌ Usuario no encontrado")
            return null
          }

          console.log("✅ Usuario encontrado:", user.email)

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            console.log("❌ Contraseña incorrecta")
            return null
          }

          console.log("✅ Login exitoso para:", user.email, "| Admin:", user.is_admin)

          // Retornar datos del usuario con tipado correcto
          return {
            id: user.id,
            email: user.email,
            name: user.full_name || user.email,
            role: user.is_admin ? 'admin' : 'user'
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      // En el primer login, agregar datos del usuario al token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Agregar datos del token a la sesión
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as 'admin' | 'user'
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }