const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint para gerar QR Code
app.post('/api/generate-qr', async (req, res) => {
  try {
    const { data, options = {} } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Dados são obrigatórios' });
    }

    // Configurações padrão
    const defaultOptions = {
      type: 'image/png',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    };

    // Mesclar opções
    const qrOptions = { ...defaultOptions, ...options };

    // Gerar QR Code como buffer
    const qrBuffer = await QRCode.toBuffer(data, qrOptions);

    // Definir tipo de conteúdo baseado no formato
    const contentType = qrOptions.type || 'image/png';
    
    res.set({
      'Content-Type': contentType,
      'Content-Length': qrBuffer.length,
      'Cache-Control': 'no-cache'
    });

    res.send(qrBuffer);

  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para gerar QR Code em SVG
app.post('/api/generate-qr-svg', async (req, res) => {
  try {
    const { data, options = {} } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Dados são obrigatórios' });
    }

    // Configurações padrão para SVG
    const defaultOptions = {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    };

    const qrOptions = { ...defaultOptions, ...options };

    // Gerar QR Code como SVG string
    const svgString = await QRCode.toString(data, qrOptions);

    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    });

    res.send(svgString);

  } catch (error) {
    console.error('Erro ao gerar QR Code SVG:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para validar URL
app.post('/api/validate-url', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ valid: false, error: 'URL é obrigatória' });
    }

    // Validar URL
    try {
      new URL(url);
      res.json({ valid: true });
    } catch (urlError) {
      res.json({ valid: false, error: 'URL inválida' });
    }

  } catch (error) {
    console.error('Erro ao validar URL:', error);
    res.status(500).json({ valid: false, error: 'Erro interno do servidor' });
  }
});

// Endpoint para gerar vCard
app.post('/api/generate-vcard', (req, res) => {
  try {
    const { name, phone, email, organization, website } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Gerar vCard
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
${organization ? `ORG:${organization}` : ''}
${phone ? `TEL:${phone}` : ''}
${email ? `EMAIL:${email}` : ''}
${website ? `URL:${website}` : ''}
END:VCARD`;

    res.json({ vcard: vcard.trim() });

  } catch (error) {
    console.error('Erro ao gerar vCard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Endpoint para servir o frontend (se necessário)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor QR Code API rodando na porta ${PORT}`);
  console.log(`📡 API Status: http://localhost:${PORT}/api/status`);
  console.log(`🎯 Endpoint principal: http://localhost:${PORT}/api/generate-qr`);
});

module.exports = app;