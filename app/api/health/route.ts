import { NextResponse } from 'next/server'
import { query } from '@/lib/database/connection'

export async function GET() {
  try {
    // Probar conexión a base de datos
    const result = await query('SELECT NOW() as current_time, COUNT(*) as articles_count FROM articles')
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        current_time: result.rows[0].current_time,
        articles_count: result.rows[0].articles_count
      },
      environment: {
        node_env: process.env.NODE_ENV,
        port: process.env.PORT || 3000,
        db_host: process.env.DB_HOST,
        db_name: process.env.DB_NAME
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}