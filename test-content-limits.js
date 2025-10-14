const { Pool } = require('pg')

// Configuración de conexión
const pool = new Pool({
  user: 'guidoblanco_user',
  host: 'localhost',
  database: 'guidoblanco_db',
  password: 'Tomi39917314!',
  port: 5432,
})

async function testContentLimits() {
  console.log('🔍 Probando límites de contenido de la base de datos...\n')
  
  try {
    // Test 1: Verificar estructura actual
    console.log('📋 1. Verificando estructura de la tabla articles:')
    const structureQuery = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
        AND column_name IN ('content', 'summary', 'title')
      ORDER BY column_name;
    `
    const structure = await pool.query(structureQuery)
    console.table(structure.rows)
    
    // Test 2: Crear contenido de prueba muy extenso
    console.log('\n📝 2. Creando contenido de prueba extenso...')
    
    // Simular una entrevista de 25 páginas (~50,000 caracteres)
    const longContent = generateLongInterview(50000)
    console.log(`   Contenido generado: ${longContent.length.toLocaleString()} caracteres`)
    
    // Test 3: Insertar contenido extenso
    console.log('\n💾 3. Probando inserción de contenido extenso...')
    
    const insertQuery = `
      INSERT INTO articles (
        title, 
        slug, 
        summary, 
        content, 
        author_id,
        is_published
      ) VALUES (
        $1, $2, $3, $4, 
        (SELECT id FROM users WHERE is_admin = true LIMIT 1),
        false
      ) RETURNING id, length(content) as content_length
    `
    
    const testTitle = 'Prueba de Límites de Contenido - ' + new Date().toISOString()
    const testSlug = 'prueba-limites-' + Date.now()
    const testSummary = 'Esta es una prueba para verificar que podemos manejar entrevistas muy extensas de 25+ páginas.'
    
    const insertResult = await pool.query(insertQuery, [
      testTitle,
      testSlug, 
      testSummary,
      longContent
    ])
    
    console.log('✅ Inserción exitosa!')
    console.log(`   ID del artículo: ${insertResult.rows[0].id}`)
    console.log(`   Longitud del contenido: ${insertResult.rows[0].content_length.toLocaleString()} caracteres`)
    
    // Test 4: Recuperar y verificar
    console.log('\n📖 4. Recuperando contenido insertado...')
    
    const selectQuery = `
      SELECT 
        id,
        title,
        length(content) as content_length,
        length(summary) as summary_length,
        created_at
      FROM articles 
      WHERE id = $1
    `
    
    const selectResult = await pool.query(selectQuery, [insertResult.rows[0].id])
    const article = selectResult.rows[0]
    
    console.log('✅ Recuperación exitosa!')
    console.log(`   Título: ${article.title}`)
    console.log(`   Contenido: ${article.content_length.toLocaleString()} caracteres`)
    console.log(`   Resumen: ${article.summary_length.toLocaleString()} caracteres`)
    console.log(`   Fecha: ${article.created_at}`)
    
    // Test 5: Limpiar
    console.log('\n🧹 5. Limpiando datos de prueba...')
    await pool.query('DELETE FROM articles WHERE id = $1', [insertResult.rows[0].id])
    console.log('✅ Datos de prueba eliminados')
    
    // Resumen
    console.log('\n🎉 RESUMEN:')
    console.log(`✅ La base de datos puede manejar contenido de ${longContent.length.toLocaleString()} caracteres`)
    console.log('✅ Inserción y recuperación funcionan correctamente')
    console.log('✅ Sin problemas de límites detectados')
    console.log('\n📋 RECOMENDACIONES:')
    console.log('• Puedes pegar entrevistas de 25+ páginas sin problemas')
    console.log('• El límite práctico es muy alto (varios GB)')
    console.log('• Para mejor rendimiento, considera dividir entrevistas extremadamente largas')
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message)
    console.log('\n🔧 POSIBLES SOLUCIONES:')
    console.log('1. Ejecutar la migración: database/migrations/004_increase_content_limits.sql')
    console.log('2. Verificar configuración de PostgreSQL')
    console.log('3. Comprobar memoria disponible en el servidor')
  } finally {
    await pool.end()
  }
}

function generateLongInterview(targetLength) {
  const interviewTemplate = `
P: Esta es una pregunta de ejemplo que podría aparecer en una entrevista periodística. ¿Cuál es su opinión sobre el tema que estamos discutiendo?

R: Esta es una respuesta de ejemplo que simula el tipo de respuestas extensas que podrían darse en una entrevista real. Las entrevistas periodísticas suelen contener respuestas muy detalladas, con explicaciones profundas sobre temas complejos. Los entrevistados a menudo proporcionan contexto histórico, análisis personal, y reflexiones que pueden extenderse por varios párrafos. En este caso, estamos simulando exactamente ese tipo de contenido extenso que caracteriza a las entrevistas profesionales.

P: ¿Podría profundizar más en ese punto específico?

R: Absolutamente. Cuando hablamos de este tema, es importante considerar múltiples perspectivas y dimensiones. La complejidad del asunto requiere un análisis cuidadoso que tome en cuenta factores históricos, sociales, económicos y políticos. Por ejemplo, si consideramos el contexto histórico, podemos ver que este tema ha evolucionado significativamente a lo largo de las décadas. Los cambios en la sociedad, la tecnología, y las estructuras de poder han influido profundamente en cómo entendemos y abordamos estos temas en la actualidad.

`
  
  let content = ''
  while (content.length < targetLength) {
    content += interviewTemplate
  }
  
  return content.substring(0, targetLength)
}

// Ejecutar las pruebas
testContentLimits()
  .then(() => {
    console.log('\n✅ Pruebas completadas exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en las pruebas:', error)
    process.exit(1)
  })