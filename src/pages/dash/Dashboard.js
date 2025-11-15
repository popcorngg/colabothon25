import { useState, useEffect } from 'react';
import "./Dashboard.css";
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
import { useSpeech } from '../../hooks/useSpeech';

export default function Dashboard() {
  const nav = useNavigate();
  const { speak, stop, isSpeaking } = useSpeech();
  const [isFlipped, setIsFlipped] = useState(false);
  const [neuralInput, setNeuralInput] = useState("");
  const [neuralResponse, setNeuralResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // Новые состояния для работы с документами
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentAnalysis, setDocumentAnalysis] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleBlick = () => nav('/blik');
  const handleSup = () => nav('/support');
  const handleCur = () => nav('/currency');
  const handleTrans = () => nav('/trans');

  const handleNeuralAction = async () => {
    if (!neuralInput.trim()) return;

    setLoading(true);
    setNeuralResponse("...Идет обработка запроса...");

    try {
      const response = await fetch("http://localhost:5000/api/neural-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: neuralInput,
          current_page: "dashboard"
        })
      });

      const data = await response.json();
      const result = data.result || "Нет ответа от нейросети";
      setNeuralResponse(result);

      // Озвучиваем ответ
      speak(result);

    } catch (error) {
      console.error("Ошибка вызова API:", error);
      const errorMsg = "Ошибка вызова API";
      setNeuralResponse(errorMsg);
      speak(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Обработка выбора файла
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'text/plain', 'text/html', 'text/markdown'];
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый тип файла. Используйте PDF, TXT, HTML или MD');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 10 МБ');
        return;
      }

      setSelectedFile(file);
      setDocumentAnalysis("");
    }
  };

  // Отправка файла на анализ
  const handleDocumentAnalysis = async () => {
    if (!selectedFile) {
      alert('Выберите файл для анализа');
      return;
    }

    setUploadLoading(true);
    setDocumentAnalysis("📄 Анализирую документ...");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch("http://localhost:5000/api/document/analyze", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const analysis = data.analysis.summary;
        setDocumentAnalysis(analysis);
        speak(analysis);
      } else {
        const errorMsg = `Ошибка: ${data.error}`;
        setDocumentAnalysis(errorMsg);
        speak(errorMsg);
      }
    } catch (error) {
      console.error("Ошибка анализа документа:", error);
      const errorMsg = `Ошибка анализа: ${error.message}`;
      setDocumentAnalysis(errorMsg);
      speak(errorMsg);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setDocumentAnalysis("");
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="dashboard">
      <div className="bank-logo">
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>

      <div className="balanceCard" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* FRONT */}
          <div className="front-card">
            <div className="card-chip"></div>
            <h1>BALANCE</h1>
            <p className="amount">1,520.30 zł</p>
            <div className="balanceCard-info">
              <span className="card-number">•••• •••• •••• 1234</span>
              <span className="card-expiry">12/28</span>
            </div>
          </div>

          {/* BACK */}
          <div className="back-card">
            <div style={{
              marginBottom: '24px',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '2px',
              opacity: '0.7',
              textTransform: 'uppercase'
            }}>
              CARD DETAILS
            </div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '14px', opacity: '0.7', marginBottom: '8px' }}>
                Card Number
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '2px' }}>
                6749 9153 2591 1234
              </div>
            </div>
            <div className="balanceCard-info">
              <div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginBottom: '4px' }}>Valid Thru</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>12/28</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginBottom: '4px' }}>CVV</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>228</div>
              </div>
            </div>
            <div style={{
              marginTop: '32px',
              fontSize: '12px',
              opacity: '0.6',
              textAlign: 'center'
            }}>Click to flip the card</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="blikBtn" onClick={handleBlick}>
          <span className="btn-blik">💳</span>
          <span className="btn-label">Blik</span>
        </button>
        <button className="currencyBtn" onClick={handleCur}>
          <span className="btn-currency">💱</span>
          <span className="btn-label">Currency</span>
        </button>
        <button className="transBtn" onClick={handleTrans}>
          <span className="btn-trans">↔</span>
          <span className="btn-label">Transfer</span>
        </button>
        <button className="supportBtn" onClick={handleSup}>
          <span className="btn-support">💬</span>
          <span className="btn-label">Support</span>
        </button>
      </div>

      <section className="transactions">
        <h2 className="transactions-title">Recent Transactions</h2>
        <ul className="transactions-list">
          <li className="transaction">
            <div className="transaction-icon income-icon">↑</div>
            <div className="transaction-details">
              <div className="transaction-name">Salary Payment</div>
              <div className="transaction-date">12 Nov 2025</div>
            </div>
            <div className="transaction-amount income">+200 zł</div>
          </li>
        </ul>
      </section>

      {/* Document Analysis Section */}
      <section className="document-section" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        borderRadius: '16px',
        marginTop: '20px',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📄 Document Analysis
        </h2>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <label htmlFor="file-input" style={{
            display: 'block',
            cursor: 'pointer',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px dashed rgba(255, 255, 255, 0.5)',
            transition: 'all 0.3s'
          }}>
            {selectedFile ? (
              <div>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>📎</div>
                <div style={{ fontWeight: '600' }}>{selectedFile.name}</div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginTop: '4px' }}>
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📤</div>
                <div>Click to upload document</div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginTop: '8px' }}>
                  PDF, TXT, HTML, MD (max 10 MB)
                </div>
              </div>
            )}
          </label>

          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt,.html,.md"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={handleDocumentAnalysis}
            disabled={!selectedFile || uploadLoading}
            style={{
              flex: 1,
              padding: '12px',
              background: selectedFile && !uploadLoading ? '#28a745' : 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedFile && !uploadLoading ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
          >
            {uploadLoading ? '⏳ Analyzing...' : '🔍 Analyze Document'}
          </button>

          {selectedFile && (
            <button
              onClick={handleClearFile}
              disabled={uploadLoading}
              style={{
                padding: '12px 20px',
                background: 'rgba(220, 53, 69, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              🗑️
            </button>
          )}
        </div>

        {documentAnalysis && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '16px',
            borderRadius: '12px',
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            lineHeight: '1.6',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {documentAnalysis}
          </div>
        )}

        {documentAnalysis && documentAnalysis !== "📄 Анализирую документ..." && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            {!isSpeaking ? (
              <button
                onClick={() => speak(documentAnalysis)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ▶️ Read Analysis
              </button>
            ) : (
              <>
                <button
                  onClick={stop}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={() => speak(documentAnalysis)}
                  style={{
                    background: '#ffc107',
                    color: 'black',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  🔄 Restart
                </button>
              </>
            )}
            <span style={{ alignSelf: 'center', fontSize: '14px', opacity: '0.8' }}>
              {isSpeaking ? '🔊 Speaking...' : ''}
            </span>
          </div>
        )}
      </section>

      {/* AI Assistant */}
      <section className="neural-section">
        <h2>💬 AI Assistant</h2>
        <input
          type="text"
          value={neuralInput}
          onChange={(e) => setNeuralInput(e.target.value)}
          placeholder="Ask me anything about your finances..."
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleNeuralAction()}
        />
        <button onClick={handleNeuralAction} disabled={loading}>
          {loading ? "Processing..." : "Send"}
        </button>

        {neuralResponse && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px',
            whiteSpace: 'pre-wrap'
          }}>
            <strong>Response:</strong> {neuralResponse}
          </div>
        )}

        {neuralResponse && neuralResponse !== "...Идет обработка запроса..." && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            {!isSpeaking ? (
              <button
                onClick={() => speak(neuralResponse)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ▶️ Read Response
              </button>
            ) : (
              <>
                <button
                  onClick={stop}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={() => speak(neuralResponse)}
                  style={{
                    background: '#ffc107',
                    color: 'black',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Restart
                </button>
              </>
            )}
            <span style={{ alignSelf: 'center', fontSize: '14px', opacity: '0.7' }}>
              {isSpeaking ? '🔊 Speaking...' : ''}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
