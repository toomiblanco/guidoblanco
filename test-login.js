require('dotenv').config({ path: '.env.local' })
const bcrypt = require('bcryptjs')
const { query } = require('./lib/database/connection')

async function testLogin() {
  console.log('🔍 Buscando usuario admin@guidoblanco.com...')

  const result = await query(
    'SELECT id, email, password_hash, full_name, is_admin FROM users WHERE email = $1',
    ['admin@guidoblanco.com']
  )

  if (result.rows.length === 0) {
    console.log('❌ Usuario NO encontrado')
    return
  }

  const user = result.rows[0]
  console.log('✅ Usuario encontrado:')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('   Nombre:', user.full_name)
  console.log('   Admin:', user.is_admin)
  console.log('   Hash:', user.password_hash)

  console.log('')
  console.log('🔐 Verificando password "admin123"...')

  const isValid = await bcrypt.compare('admin123', user.password_hash)

  if (isValid) {
    console.log('✅ Password CORRECTA')
    console.log('')
    console.log('🎉 La autenticación debería funcionar')
  } else {
    console.log('❌ Password INCORRECTA')
    console.log('')
    console.log('⚠️  El hash en la BD no corresponde a "admin123"')
  }

  process.exit(0)
}

testLogin().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
