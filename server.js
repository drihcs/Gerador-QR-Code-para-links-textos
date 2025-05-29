import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/generate-qr', async (req, res) => {
  try {
    const { text, size = 256, dark = '#000000', light = '#FFFFFF' } = req.body;
    
    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark,
        light
      },
      width: size
    };

    const qrDataUrl = await QRCode.toDataURL(text, qrOptions);
    res.json({ qrCode: qrDataUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});