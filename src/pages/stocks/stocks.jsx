import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './stocks.css';
import logo from '../dash/logo.png';

export default function Stocks() {
  const nav = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // AI состояния
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sample stocks data
  const [stocks] = useState([
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 189.95,
      change: 5.2,
      currency: 'USD',
      data: [
        { time: 'Mon', price: 180.5 },
        { time: 'Tue', price: 182.3 },
        { time: 'Wed', price: 181.8 },
        { time: 'Thu', price: 185.2 },
        { time: 'Fri', price: 188.7 },
        { time: 'Sat', price: 187.4 },
        { time: 'Sun', price: 189.95 },
      ]
    },
    {
      id: 2,
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.58,
      change: -2.5,
      currency: 'USD',
      data: [
        { time: 'Mon', price: 146.2 },
        { time: 'Tue', price: 145.8 },
        { time: 'Wed', price: 144.3 },
        { time: 'Thu', price: 143.5 },
        { time: 'Fri', price: 142.9 },
        { time: 'Sat', price: 143.1 },
        { time: 'Sun', price: 142.58 },
      ]
    },
    {
      id: 3,
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 378.91,
      change: 3.8,
      currency: 'USD',
      data: [
        { time: 'Mon', price: 365.0 },
        { time: 'Tue', price: 367.5 },
        { time: 'Wed', price: 370.2 },
        { time: 'Thu', price: 374.1 },
        { time: 'Fri', price: 376.3 },
        { time: 'Sat', price: 377.8 },
        { time: 'Sun', price: 378.91 },
      ]
    },
    {
      id: 4,
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 242.56,
      change: -4.3,
      currency: 'USD',
      data: [
        { time: 'Mon', price: 253.0 },
        { time: 'Tue', price: 251.2 },
        { time: 'Wed', price: 248.5 },
        { time: 'Thu', price: 245.8 },
        { time: 'Fri', price: 243.2 },
        { time: 'Sat', price: 242.9 },
        { time: 'Sun', price: 242.56 },
      ]
    },
    {
      id: 5,
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 181.45,
      change: 6.1,
      currency: 'USD',
      data: [
        { time: 'Mon', price: 171.0 },
        { time: 'Tue', price: 173.5 },
        { time: 'Wed', price: 175.8 },
        { time: 'Thu', price: 178.2 },
        { time: 'Fri', price: 180.1 },
        { time: 'Sat', price: 180.8 },
        { time: 'Sun', price: 181.45 },
      ]
    },
    {
      id: 6,
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 875.30,
      change: 12.5,
      currency: 'USD',
      data: [
        { time: 'Mon', price: 776.0 },
        { time: 'Tue', price: 795.5 },
        { time: 'Wed', price: 810.2 },
        { time: 'Thu', price: 835.8 },
        { time: 'Fri', price: 860.5 },
        { time: 'Sat', price: 870.2 },
        { time: 'Sun', price: 875.30 },
      ]
    },
  ]);

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // AI функционал
  const handleAIRequest = async () => {
    if (!aiInput.trim()) return;

    setLoading(true);
    setAiResponse('📈 Analyzing market data...');

    try {
      const response = await fetch('http://localhost:5000/api/neural-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: aiInput,
          current_page: 'stocks',
          stocks: stocks, // Отправляем данные о акциях
          selected_stock: selectedStock, // Отправляем выбранную акцию если есть
        }),
      });

      const data = await response.json();
      const result = data.result || 'No response from AI';

      setAiResponse(result);

      // Проверяем навигацию
      if (data.action && data.action.type === "navigate") {
        speak(result);
        setTimeout(() => {
          nav(data.action.route);
        }, 1500);
      } else {
        speak(result);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMsg = 'Error connecting to AI assistant';
      setAiResponse(errorMsg);
      speak(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Озвучивание
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      if (text.match(/[а-яА-ЯЁё]/)) {
        utterance.lang = 'ru-RU';
      } else if (text.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/)) {
        utterance.lang = 'pl-PL';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Find max and min prices for chart scaling
  const getChartDimensions = (data) => {
    const prices = data.map(d => d.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const padding = (maxPrice - minPrice) * 0.1;
    return {
      maxPrice: maxPrice + padding,
      minPrice: Math.max(0, minPrice - padding)
    };
  };

  // Calculate Y position for chart
  const getYPosition = (price, minPrice, maxPrice, chartHeight) => {
    const range = maxPrice - minPrice;
    return ((maxPrice - price) / range) * chartHeight;
  };

  return (
    <div className="stocks-page">
      {/* Logo */}
      <div className="bank-logo" onClick={() => nav('/')}>
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>

      {/* Header */}
      <div className="stocks-header">
        <button className="back-btn" onClick={() => nav('/')}>
          ← Back
        </button>
        <h1 className="stocks-title">Stock Market</h1>
        <button className="ai-toggle-btn" onClick={() => setShowAI(!showAI)}>
          {showAI ? '✕' : '🤖 AI Analyst'}
        </button>
      </div>

      {/* AI Assistant Panel */}
      {showAI && (
        <div className="ai-panel">
          <h3 className="ai-panel-title">💹 AI Investment Analyst</h3>
          <p className="ai-panel-hint">
            Ask: "Which stock should I buy?", "Analyze AAPL", "Compare TSLA and NVDA", "What's the best performer?"
          </p>
          <div className="ai-input-container">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask for investment advice..."
              className="ai-input"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleAIRequest()}
            />
            <button
              onClick={handleAIRequest}
              disabled={loading || !aiInput.trim()}
              className="ai-send-btn"
            >
              {loading ? '⏳' : '→'}
            </button>
          </div>

          {aiResponse && (
            <div className="ai-response-box">
              <div className="ai-response-content">{aiResponse}</div>
              {aiResponse && aiResponse !== '📈 Analyzing market data...' && (
                <div className="ai-audio-controls">
                  {!isSpeaking ? (
                    <button onClick={() => speak(aiResponse)} className="audio-btn">
                      ▶️ Read
                    </button>
                  ) : (
                    <>
                      <button onClick={stop} className="audio-btn stop">
                        ⏹️ Stop
                      </button>
                      <button onClick={() => speak(aiResponse)} className="audio-btn">
                        🔄 Restart
                      </button>
                    </>
                  )}
                  {isSpeaking && <span className="speaking-indicator">🔊</span>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="stocks-container">
        {!selectedStock ? (
          <>
            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Search stocks by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Stocks List */}
            <div className="stocks-list-container">
              <div className="stocks-list">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="stock-item"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="stock-info">
                      <div className="stock-symbol">{stock.symbol}</div>
                      <div className="stock-name">{stock.name}</div>
                    </div>

                    <div className="stock-price-info">
                      <div className="stock-price">
                        {stock.price.toFixed(2)} {stock.currency}
                      </div>
                      <div className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                        {stock.change >= 0 ? '↑' : '↓'} {Math.abs(stock.change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredStocks.length === 0 && (
                <div className="no-results">
                  No stocks found matching your search
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Stock Details */}
            <div className="stock-details-header">
              <button
                className="back-btn"
                onClick={() => setSelectedStock(null)}
              >
                ← Back to Stocks
              </button>
              <div className="stock-details-info">
                <h2 className="stock-details-symbol">{selectedStock.symbol}</h2>
                <p className="stock-details-name">{selectedStock.name}</p>
                <div className="stock-details-price">
                  <span className="price">{selectedStock.price.toFixed(2)} {selectedStock.currency}</span>
                  <span className={`change ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                    {selectedStock.change >= 0 ? '↑' : '↓'} {Math.abs(selectedStock.change).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Weekly Price Chart</h3>
              <svg
                className="chart-svg"
                viewBox="0 0 800 400"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 215, 0, 0.3)" />
                    <stop offset="100%" stopColor="rgba(255, 215, 0, 0.05)" />
                  </linearGradient>
                </defs>

                <line x1="60" y1="20" x2="60" y2="350" stroke="#444" strokeWidth="2" />
                <line x1="60" y1="350" x2="750" y2="350" stroke="#444" strokeWidth="2" />

                {(() => {
                  const { maxPrice, minPrice } = getChartDimensions(selectedStock.data);
                  const labels = [];
                  const step = (maxPrice - minPrice) / 4;
                  for (let i = 0; i <= 4; i++) {
                    const price = maxPrice - (i * step);
                    const y = (i / 4) * 330 + 20;
                    labels.push(
                      <g key={`y-label-${i}`}>
                        <text x="50" y={y + 5} textAnchor="end" fontSize="12" fill="#aaa">
                          ${price.toFixed(0)}
                        </text>
                        <line x1="60" y1={y} x2="750" y2={y} stroke="#333" strokeWidth="1" strokeDasharray="5,5" />
                      </g>
                    );
                  }
                  return labels;
                })()}

                {selectedStock.data.map((point, index) => {
                  const { maxPrice, minPrice } = getChartDimensions(selectedStock.data);
                  const x = 60 + (index / (selectedStock.data.length - 1)) * 690;
                  const y = getYPosition(point.price, minPrice, maxPrice, 330) + 20;

                  return (
                    <g key={`point-${index}`}>
                      <text x={x} y="375" textAnchor="middle" fontSize="12" fill="#aaa">
                        {point.time}
                      </text>
                      <circle cx={x} cy={y} r="5" fill="#ffd700" stroke="#fff" strokeWidth="2" />
                    </g>
                  );
                })}

                {(() => {
                  const { maxPrice, minPrice } = getChartDimensions(selectedStock.data);
                  const points = selectedStock.data
                    .map((point, index) => {
                      const x = 60 + (index / (selectedStock.data.length - 1)) * 690;
                      const y = getYPosition(point.price, minPrice, maxPrice, 330) + 20;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <>
                      <polyline points={points} fill="none" stroke="#ffd700" strokeWidth="2" />
                      <polygon points={`60,350 ${points} 750,350`} fill="url(#chartGradient)" />
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Data Table */}
            <div className="data-table-container">
              <h3 className="table-title">Weekly Data</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Price</th>
                    <th>Change from Previous</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStock.data.map((point, index) => {
                    const prevPrice = index > 0 ? selectedStock.data[index - 1].price : point.price;
                    const change = point.price - prevPrice;
                    const changePercent = ((change / prevPrice) * 100).toFixed(2);

                    return (
                      <tr key={`data-${index}`}>
                        <td>{point.time}</td>
                        <td>${point.price.toFixed(2)}</td>
                        <td className={change >= 0 ? 'positive' : 'negative'}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}