import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Obtiene la sesión actual del usuario
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Obtiene el usuario actual de la sesión
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Requiere que el usuario esté autenticado
 * Lanza un error si no hay sesión
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }
  return session.user
}

/**
 * Requiere que el usuario sea administrador
 * Lanza un error si no está autenticado o no es admin
 */
export async function requireAdmin() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error('Authentication required')
  }

  if (session.user.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return session.user
}

/**
 * Verifica si el usuario actual es administrador
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === 'admin'
}

/**
 * Verifica si hay una sesión activa
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session?.user
}