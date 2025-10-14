import { Pool, PoolClient } from 'pg'

// Validar variables de entorno requeridas
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  )
}

// Configuración de conexión a PostgreSQL
const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL según ambiente
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Pool settings
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}

// Crear pool de conexiones
const pool = new Pool(poolConfig)

// Event handlers para el pool
pool.on('connect', (client: PoolClient) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Nueva conexión a PostgreSQL establecida')
  }
})

pool.on('error', (err: Error, client: PoolClient) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err)
})

pool.on('remove', (client: PoolClient) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Cliente removido del pool')
  }
})

/**
 * Función helper para ejecutar queries con manejo de errores mejorado
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  let client: PoolClient | undefined

  try {
    client = await pool.connect()
    const res = await client.query(text, params)
    const duration = Date.now() - start

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query ejecutada:', {
        duration: `${duration}ms`,
        rows: res.rowCount,
        query: text.substring(0, 100)
      })
    }

    return res
  } catch (error) {
    const duration = Date.now() - start
    console.error('❌ Error en query:', {
      duration: `${duration}ms`,
      query: text.substring(0, 100),
      params: params?.length || 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

/**
 * Función para obtener una conexión del pool
 */
export async function getClient() {
  try {
    return await pool.connect()
  } catch (error) {
    console.error('❌ Error obteniendo cliente del pool:', error)
    throw error
  }
}

/**
 * Cerrar el pool al terminar la aplicación
 */
export async function closePool() {
  try {
    await pool.end()
    console.log('✅ Pool de conexiones cerrado correctamente')
  } catch (error) {
    console.error('❌ Error cerrando pool:', error)
    throw error
  }
}

/**
 * Verificar conexión a la base de datos
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now, current_database() as database')
    console.log('✅ Conexión a PostgreSQL exitosa:', {
      database: result.rows[0].database,
      timestamp: result.rows[0].now
    })
    return true
  } catch (error) {
    console.error('❌ Fallo en test de conexión:', error)
    return false
  }
}

export default pool