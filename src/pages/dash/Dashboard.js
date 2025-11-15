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
  const handleAnal = () => nav('/analitics');
  const handleCont = () => nav('/contacs');

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

      <div className='upper-interface'>
        {/* Document Analysis Button */}
        <button className="analysisBtn" onClick={handleAnal}>
          <span className="btn-icon">📄</span>
          <span className="btn-text">Document Analyst</span>
          <span className="btn-arrow">→</span>
        </button>

        {/* Contacts page */}
        <button className="contactsBtn" onClick={handleCont}>
          <span className="btn-icon">👥</span>
          <span className="btn-text">Contacts</span>
          <span className="btn-arrow">→</span>
        </button>
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
    </div>
  );
}
