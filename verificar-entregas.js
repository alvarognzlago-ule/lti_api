// Script de prueba para verificar las entregas guardadas
require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function verificarEntregas() {
  console.log('🔍 Verificando entregas guardadas...\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/debug/submissions`);
    const data = response.data;
    
    console.log(`📊 Total de entregas: ${data.total}\n`);
    
    if (data.total === 0) {
      console.log('❌ No hay entregas registradas aún.');
      console.log('\n💡 Para probar:');
      console.log('1. Entra como estudiante desde Moodle');
      console.log('2. Sube un archivo');
      console.log('3. Completa el cuestionario');
      console.log('4. Vuelve a ejecutar este script\n');
      return;
    }
    
    data.submissions.forEach((sub, index) => {
      console.log(`\n📦 Entrega ${index + 1}:`);
      console.log(`   ID: ${sub.submissionId}`);
      console.log(`   👤 Estudiante: ${sub.userName} (ID: ${sub.userId})`);
      console.log(`   📎 Archivo: ${sub.fileName} (${formatBytes(sub.fileSize)})`);
      console.log(`   📁 Ruta: ${sub.filePath}`);
      console.log(`   💬 Comentarios: ${sub.comments || '(sin comentarios)'}`);
      console.log(`   ⏰ Subido: ${new Date(sub.uploadedAt).toLocaleString('es-ES')}`);
      
      if (sub.questionnaire) {
        console.log(`\n   📝 Cuestionario completado:`);
        console.log(`      ⏱️  Tiempo dedicado: ${sub.questionnaire.timeSpent}`);
        console.log(`      📊 Dificultad: ${sub.questionnaire.difficulty}`);
        console.log(`      📚 Recursos: ${sub.questionnaire.resourcesUsed.join(', ') || 'ninguno'}`);
        console.log(`      💭 Desafíos: ${sub.questionnaire.challenges.substring(0, 50)}...`);
        console.log(`      🎓 Aprendizajes: ${sub.questionnaire.learnings.substring(0, 50)}...`);
        console.log(`      ✅ Completado: ${new Date(sub.questionnaire.completedAt).toLocaleString('es-ES')}`);
      } else {
        console.log(`\n   ⚠️  Cuestionario pendiente`);
      }
      
      console.log('   ' + '─'.repeat(60));
    });
    
    console.log('\n✅ Verificación completada\n');
    
  } catch (error) {
    console.error('❌ Error al verificar entregas:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  El servidor no está ejecutándose.');
      console.log('   Ejecuta: node lti-server.js\n');
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Ejecutar verificación
verificarEntregas();
