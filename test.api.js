// Script para testar a API do QR Code
// Execute com: node test-api.js

const fs = require('fs');
const path = require('path');

// Função para testar a API
async function testQRCodeAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🧪 Iniciando testes da API QR Code...\n');

  // Teste 1: Status da API
  try {
    console.log('📡 Testando status da API...');
    const response = await fetch(`${baseURL}/status`);
    const data = await response.json();
    console.log('✅ Status:', data);
    console.log('');
  } catch (error) {
    console.log('❌ Erro no teste de status:', error.message);
    return;
  }

  // Teste 2: Gerar QR Code PNG
  try {
    console.log('🖼️  Testando geração de QR Code PNG...');
    const response = await fetch(`${baseURL}/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: 'https://github.com',
        options: {
          width: 300,
          color: {
            dark: '#1a365d',
            light: '#ffffff'
          }
        }
      })
    });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      fs.writeFileSync('test-qr.png', Buffer.from(buffer));
      console.log('✅ QR Code PNG gerado e salvo como test-qr.png');
    } else {
      console.log('❌ Erro ao gerar QR Code PNG');
    }
    console.log('');
  } catch (error) {
    console.log('❌ Erro no teste PNG:', error.message);
  }

  // Teste 3: Gerar QR Code SVG
  try {
    console.log('🎨 Testando geração de QR Code SVG...');
    const response = await fetch(`${baseURL}/generate-qr-svg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: 'Olá, mundo! Este é um teste de QR Code.',
        options: {
          width: 250,
          color: {
            dark: '#2d3748',
            light: '#f7fafc'
          }
        }
      })
    });

    if (response.ok) {
      const svgContent = await response.text();
      fs.writeFileSync('test-qr.svg', svgContent);
      console.log('✅ QR Code SVG gerado e salvo como test-qr.svg');
    } else {
      console.log('❌ Erro ao gerar QR Code SVG');
    }
    console.log('');
  } catch (error) {
    console.log('❌ Erro no teste SVG:', error.message);
  }

  // Teste 4: Validar URL
  try {
    console.log('🔍 Testando validação de URL...');
    
    // URL válida
    let response = await fetch(`${baseURL}/validate-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.google.com'
      })
    });
    let data = await response.json();
    console.log('✅ URL válida:', data);

    // URL inválida
    response = await fetch(`${baseURL}/validate-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'url-invalida'
      })
    });
    data = await response.json();
    console.log('❌ URL inválida:', data);
    console.log('');
  } catch (error) {
    console.log('❌ Erro no teste de validação:', error.message);
  }

  // Teste 5: Gerar vCard
  try {
    console.log('👤 Testando geração de vCard...');
    const response = await fetch(`${baseURL}/generate-vcard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'João da Silva',
        phone: '+55 11 99999-9999',
        email: 'joao@exemplo.com',
        organization: 'Empresa ABC'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ vCard gerado:');
      console.log(data.vcard);

      // Gerar QR Code do vCard
      const qrResponse = await fetch(`${baseURL}/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data.vcard,
          options: {
            width: 300,
            errorCorrectionLevel: 'M'
          }
        })
      });

      if (qrResponse.ok) {
        const buffer = await qrResponse.arrayBuffer();
        fs.writeFileSync('test-vcard-qr.png', Buffer.from(buffer));
        console.log('✅ QR Code do vCard salvo como test-vcard-qr.png');
      }
    } else {
      console.log('❌ Erro ao gerar vCard');
    }
    console.log('');
  } catch (error) {
    console.log('❌ Erro no teste vCard:', error.message);
  }

  // Teste 6: Teste de erro (dados faltando)
  try {
    console.log('🚫 Testando tratamento de erro...');
    const response = await fetch(`${baseURL}/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log('✅ Erro tratado corretamente:', data);
    console.log('');
  } catch (error) {
    console.log('❌ Erro no teste de erro:', error.message);
  }

  console.log('🎉 Testes concluídos!');
  console.log('\n📁 Arquivos gerados:');
  console.log('   - test-qr.png (QR Code de URL)');
  console.log('   - test-qr.svg (QR Code de texto)');
  console.log('   - test-vcard-qr.png (QR Code de contato)');
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  testQRCodeAPI().catch(console.error);
}

module.exports = { testQRCodeAPI };

// Função auxiliar para testar individualmente
function testSingleEndpoint(endpoint, data) {
  return fetch(`http://localhost:3001/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
}

// Exemplos de uso individual
/*
// Testar geração de QR Code
testSingleEndpoint('generate-qr', {
  data: 'https://exemplo.com',
  options: { width: 200 }
}).then(response => {
  if (response.ok) {
    return response.arrayBuffer();
  }
}).then(buffer => {
  fs.writeFileSync('qr-custom.png', Buffer.from(buffer));
  console.log('QR Code salvo!');
});

// Testar validação de URL
testSingleEndpoint('validate-url', {
  url: 'https://google.com'
}).then(response => response.json())
  .then(data => console.log('Validação:', data));
*/