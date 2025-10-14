/**
 * Script de prueba de conexión a PostgreSQL
 * Ejecutar con: node test-connection.js
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
})

async function testConnection() {
  console.log('🔍 Probando conexión a PostgreSQL...\n')
  console.log('📝 Configuración:')
  console.log(`   Host: ${process.env.DB_HOST}`)
  console.log(`   Puerto: ${process.env.DB_PORT}`)
  console.log(`   Base de datos: ${process.env.DB_NAME}`)
  console.log(`   Usuario: ${process.env.DB_USER}`)
  console.log('')

  try {
    // Test de conexión básico
    console.log('1️⃣ Probando conexión básica...')
    const result = await pool.query('SELECT NOW() as now, current_database() as database, version()')
    console.log(`   ✅ Conectado a: ${result.rows[0].database}`)
    console.log(`   ⏰ Timestamp: ${result.rows[0].now}`)
    console.log(`   🐘 ${result.rows[0].version.split(',')[0]}`)
    console.log('')

    // Verificar tablas
    console.log('2️⃣ Verificando tablas existentes...')
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    const expectedTables = ['users', 'categories', 'tags', 'articles', 'article_tags']
    const existingTables = tables.rows.map(r => r.table_name)

    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ Tabla '${table}' existe`)
      } else {
        console.log(`   ❌ Tabla '${table}' NO existe`)
      }
    }
    console.log('')

    // Verificar usuarios admin
    console.log('3️⃣ Verificando usuarios admin...')
    const users = await pool.query('SELECT email, is_admin, created_at FROM users WHERE is_admin = true')

    if (users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`   ✅ Admin: ${user.email}`)
      })
    } else {
      console.log('   ⚠️  No hay usuarios admin creados')
    }
    console.log('')

    // Estadísticas
    console.log('4️⃣ Estadísticas de la base de datos:')
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM tags) as tags,
        (SELECT COUNT(*) FROM articles) as articles
    `)

    const s = stats.rows[0]
    console.log(`   👥 Usuarios: ${s.users}`)
    console.log(`   📁 Categorías: ${s.categories}`)
    console.log(`   🏷️  Etiquetas: ${s.tags}`)
    console.log(`   📄 Artículos: ${s.articles}`)
    console.log('')

    console.log('✅ ¡Todas las pruebas completadas exitosamente!')

  } catch (error) {
    console.error('\n❌ Error en la conexión:')
    console.error(error.message)

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 El servidor PostgreSQL no está respondiendo.')
      console.error('   Verifica que:')
      console.error('   1. PostgreSQL esté corriendo en el VPS')
      console.error('   2. El puerto 5432 esté abierto')
      console.error('   3. El host y credenciales sean correctos')
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 No se puede resolver el host.')
      console.error('   Verifica la dirección IP en DB_HOST')
    }
  } finally {
    await pool.end()
  }
}

testConnection()
