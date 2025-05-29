import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

function App() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [serverQR, setServerQR] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('qrHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (text) {
      generateServerQR();
    }
  }, [text, size, bgColor, fgColor]);

  const generateServerQR = async () => {
    try {
      const response = await fetch('http://localhost:3000/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          size,
          dark: fgColor,
          light: bgColor
        })
      });
      
      const data = await response.json();
      setServerQR(data.qrCode);
    } catch (error) {
      console.error('Failed to generate QR code from server:', error);
    }
  };

  const saveToHistory = () => {
    if (!text) return;
    
    const newEntry = {
      text,
      size,
      bgColor,
      fgColor,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('qrHistory', JSON.stringify(updatedHistory));
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = serverQR;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    saveToHistory();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('qrHistory');
  };

  const loadFromHistory = (entry) => {
    setText(entry.text);
    setSize(entry.size);
    setBgColor(entry.bgColor);
    setFgColor(entry.fgColor);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Gerador de QR Code</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL ou Texto
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Digite uma URL ou texto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho ({size}x{size})
                </label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor do QR Code
                  </label>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              {text && (
                <button
                  onClick={downloadQR}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download PNG
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center">
              {text ? (
                serverQR ? (
                  <img src={serverQR} alt="QR Code" />
                ) : (
                  <QRCodeCanvas
                    value={text}
                    size={size}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    level="H"
                    includeMargin={true}
                  />
                )
              ) : (
                <div className="text-gray-400 text-center">
                  Digite algo para gerar o QR Code
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Histórico</h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center">Nenhum histórico ainda</p>
                ) : (
                  history.map((entry, index) => (
                    <button
                      key={index}
                      onClick={() => loadFromHistory(entry)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm truncate"
                    >
                      {entry.text}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;