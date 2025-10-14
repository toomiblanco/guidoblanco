require('dotenv').config({ path: '.env.local' })
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

// Configurar conexión directa
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function testLogin() {
  console.log('📝 Configuración de BD:')
  console.log('   Host:', process.env.DB_HOST)
  console.log('   Puerto:', process.env.DB_PORT)
  console.log('   Database:', process.env.DB_NAME)
  console.log('   User:', process.env.DB_USER)
  console.log('')

  console.log('🔍 Buscando usuario admin@guidoblanco.com...')

  const result = await pool.query(
    'SELECT id, email, password_hash, full_name, is_admin FROM users WHERE email = $1',
    ['admin@guidoblanco.com']
  )

  if (result.rows.length === 0) {
    console.log('❌ Usuario NO encontrado')
    await pool.end()
    return
  }

  const user = result.rows[0]
  console.log('✅ Usuario encontrado:')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('   Nombre:', user.full_name)
  console.log('   Admin:', user.is_admin)
  console.log('   Hash:', user.password_hash.substring(0, 20) + '...')

  console.log('')
  console.log('🔐 Verificando password "admin123"...')

  const isValid = await bcrypt.compare('admin123', user.password_hash)

  console.log('')
  if (isValid) {
    console.log('✅ ✅ ✅ Password CORRECTA ✅ ✅ ✅')
    console.log('')
    console.log('🎉 La autenticación básica funciona correctamente')
    console.log('   El problema debe estar en NextAuth o la configuración')
  } else {
    console.log('❌ ❌ ❌ Password INCORRECTA ❌ ❌ ❌')
    console.log('')
    console.log('⚠️  El hash en la BD NO corresponde a "admin123"')
    console.log('   Necesitas resetear la contraseña del usuario admin')
  }

  await pool.end()
  process.exit(0)
}

testLogin().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
