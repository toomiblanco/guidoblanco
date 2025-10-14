require('dotenv').config({ path: '.env.local' })
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function resetPassword() {
  console.log('🔐 Generando nuevo hash para "admin123"...')

  // Generar nuevo hash con bcrypt (10 rounds)
  const newHash = await bcrypt.hash('admin123', 10)

  console.log('✅ Hash generado:', newHash)
  console.log('')
  console.log('📝 Actualizando contraseña en la base de datos...')

  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, is_admin',
    [newHash, 'admin@guidoblanco.com']
  )

  if (result.rowCount > 0) {
    console.log('✅ Contraseña actualizada exitosamente')
    console.log('   Usuario:', result.rows[0].email)
    console.log('   Admin:', result.rows[0].is_admin)
    console.log('')
    console.log('🔐 Verificando que el hash funciona...')

    // Verificar que el hash funciona
    const isValid = await bcrypt.compare('admin123', newHash)

    if (isValid) {
      console.log('✅ ✅ ✅ HASH VERIFICADO CORRECTAMENTE ✅ ✅ ✅')
      console.log('')
      console.log('🎉 Ahora puedes hacer login con:')
      console.log('   Email: admin@guidoblanco.com')
      console.log('   Password: admin123')
    } else {
      console.log('❌ Error en la verificación del hash')
    }
  } else {
    console.log('❌ No se encontró el usuario admin@guidoblanco.com')
  }

  await pool.end()
  process.exit(0)
}

resetPassword().catch(err => {
  console.error('❌ Error:', err)
  pool.end()
  process.exit(1)
})
