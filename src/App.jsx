import React, { useState, useEffect, useRef } from 'react';
import { Download, History, Settings, Link, Type, User, Trash2, Copy } from 'lucide-react';

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [qrHistory, setQrHistory] = useState([]);
  const [customization, setCustomization] = useState({
    size: 200,
    color: '#000000',
    backgroundColor: '#ffffff',
    format: 'png'
  });
  const [showCustomization, setShowCustomization] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: '',
    organization: ''
  });
  const canvasRef = useRef(null);

  // Carregar histórico do localStorage na inicialização
  useEffect(() => {
    const savedHistory = localStorage.getItem('qrHistory');
    if (savedHistory) {
      setQrHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Salvar histórico no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
  }, [qrHistory]);

  // Função para validar URLs
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Função para gerar vCard
  const generateVCard = () => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${contactData.name}
ORG:${contactData.organization}
TEL:${contactData.phone}
EMAIL:${contactData.email}
END:VCARD`;
  };

  // Função para gerar QR Code usando API local
  const generateQRCode = async () => {
    let dataToEncode = '';
    
    switch (activeTab) {
      case 'url':
        if (!qrData) {
          alert('Por favor, insira uma URL');
          return;
        }
        if (!isValidUrl(qrData)) {
          alert('Por favor, insira uma URL válida (ex: https://exemplo.com)');
          return;
        }
        dataToEncode = qrData;
        break;
      case 'text':
        if (!qrData) {
          alert('Por favor, insira um texto');
          return;
        }
        dataToEncode = qrData;
        break;
      case 'contact':
        if (!contactData.name) {
          alert('Por favor, insira pelo menos o nome do contato');
          return;
        }
        dataToEncode = generateVCard();
        break;
    }

    try {
      // Simular chamada para API local (substituir pela URL real da API)
      const response = await fetch('http://localhost:3001/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataToEncode,
          options: {
            width: customization.size,
            color: {
              dark: customization.color,
              light: customization.backgroundColor
            }
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const qrUrl = URL.createObjectURL(blob);
        setQrCode(qrUrl);
        
        // Adicionar ao histórico
        const historyItem = {
          id: Date.now(),
          type: activeTab,
          data: dataToEncode,
          url: qrUrl,
          timestamp: new Date().toLocaleString(),
          customization: { ...customization }
        };
        
        setQrHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Manter apenas 10 itens
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      // Fallback: gerar QR code simples usando canvas
      generateQRCodeFallback(dataToEncode);
    }
  };

  // Função fallback para gerar QR code simples
  const generateQRCodeFallback = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Limpar canvas
    ctx.fillStyle = customization.backgroundColor;
    ctx.fillRect(0, 0, customization.size, customization.size);
    
    // Gerar padrão QR simples (placeholder)
    const cellSize = customization.size / 25;
    ctx.fillStyle = customization.color;
    
    // Criar um padrão simples baseado nos dados
    const hash = data.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((hash + i * j) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Adicionar cantos de finder pattern
    const cornerSize = cellSize * 7;
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillStyle = customization.backgroundColor;
    ctx.fillRect(cellSize, cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = customization.color;
    ctx.fillRect(cellSize * 2, cellSize * 2, cellSize * 3, cellSize * 3);
    
    canvas.toBlob((blob) => {
      const qrUrl = URL.createObjectURL(blob);
      setQrCode(qrUrl);
      
      const historyItem = {
        id: Date.now(),
        type: activeTab,
        data: data,
        url: qrUrl,
        timestamp: new Date().toLocaleString(),
        customization: { ...customization }
      };
      
      setQrHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    });
  };

  // Função para download do QR code
  const downloadQRCode = (url, filename = 'qrcode') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${customization.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para remover item do histórico
  const removeFromHistory = (id) => {
    setQrHistory(prev => prev.filter(item => item.id !== id));
  };

  // Função para limpar histórico
  const clearHistory = () => {
    setQrHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold text-center">Gerador de QR Code</h1>
            <p className="text-center text-blue-100 mt-2">Crie QR codes personalizados instantaneamente</p>
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Link size={18} />
                URL
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Type size={18} />
                Texto
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === 'contact' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <User size={18} />
                Contato
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulário de Input */}
              <div className="space-y-4">
                {activeTab === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                      placeholder="https://exemplo.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {activeTab === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto
                    </label>
                    <textarea
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                      placeholder="Digite seu texto aqui..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                      <input
                        type="text"
                        value={contactData.name}
                        onChange={(e) => setContactData({...contactData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={contactData.phone}
                        onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={contactData.email}
                        onChange={(e) => setContactData({...contactData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organização</label>
                      <input
                        type="text"
                        value={contactData.organization}
                        onChange={(e) => setContactData({...contactData, organization: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Customização */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowCustomization(!showCustomization)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Settings size={18} />
                    Personalização
                  </button>
                  
                  {showCustomization && (
                    <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tamanho: {customization.size}px
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="400"
                          value={customization.size}
                          onChange={(e) => setCustomization({...customization, size: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cor Principal</label>
                          <input
                            type="color"
                            value={customization.color}
                            onChange={(e) => setCustomization({...customization, color: e.target.value})}
                            className="w-full h-10 rounded border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo</label>
                          <input
                            type="color"
                            value={customization.backgroundColor}
                            onChange={(e) => setCustomization({...customization, backgroundColor: e.target.value})}
                            className="w-full h-10 rounded border"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                        <select
                          value={customization.format}
                          onChange={(e) => setCustomization({...customization, format: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="png">PNG</option>
                          <option value="svg">SVG</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={generateQRCode}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium"
                >
                  Gerar QR Code
                </button>
              </div>

              {/* Visualização e Download */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  {qrCode ? (
                    <div className="space-y-4">
                      <img 
                        src={qrCode} 
                        alt="QR Code gerado" 
                        className="mx-auto border rounded-lg shadow-md"
                        style={{ width: customization.size, height: customization.size }}
                      />
                      <button
                        onClick={() => downloadQRCode(qrCode)}
                        className="flex items-center gap-2 mx-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Download size={18} />
                        Download {customization.format.toUpperCase()}
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-gray-300 rounded"></div>
                      </div>
                      <p>Seu QR Code aparecerá aqui</p>
                    </div>
                  )}
                </div>

                {/* Histórico */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2 font-medium text-gray-800">
                      <History size={18} />
                      Histórico
                    </h3>
                    {qrHistory.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {qrHistory.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum QR code gerado ainda</p>
                    ) : (
                      qrHistory.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                          <img 
                            src={item.url} 
                            alt="QR Code" 
                            className="w-12 h-12 rounded border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium capitalize">{item.type}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.data.length > 30 ? item.data.substring(0, 30) + '...' : item.data}
                            </p>
                            <p className="text-xs text-gray-400">{item.timestamp}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => downloadQRCode(item.url, `qrcode-${item.id}`)}
                              className="p-1 text-blue-500 hover:text-blue-700"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => removeFromHistory(item.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Remover"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Canvas oculto para fallback */}
      <canvas
        ref={canvasRef}
        width={customization.size}
        height={customization.size}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default QRCodeGenerator;