import express from 'express';
import QRCode from 'qrcode';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/generate-qr', async (req, res) => {
  try {
    const { text, size = 256, bgColor = '#FFFFFF', fgColor = '#000000' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const qrOptions = {
      width: size,
      margin: 1,
      color: {
        dark: fgColor,
        light: bgColor
      }
    };

    const qrDataUrl = await QRCode.toDataURL(text, qrOptions);
    res.json({ qrCode: qrDataUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.listen(port, () => {
  console.log(`QR Code server running at http://localhost:${port}`);
});