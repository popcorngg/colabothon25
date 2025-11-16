import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './anal.css';
import logo from '../dash/logo.png';

export default function Anal({ analyzeFile, onAnalyzeFile }) {
  const nav = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documentAnalysis, setDocumentAnalysis] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['application/pdf', 'text/plain', 'text/html', 'text/markdown'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please use PDF, TXT, HTML or MD files.');
      return;
    }

    // Проверка размера (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10 MB');
      return;
    }

    setSelectedFile(file);
    setDocumentAnalysis(''); // Очищаем предыдущий анализ
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setDocumentAnalysis('');
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleDocumentAnalysis = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploadLoading(true);
    setDocumentAnalysis('📄 Analyzing document...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      // Добавляем информацию о текущей странице
      formData.append('current_page', 'document_analysis');

      // ИСПРАВЛЕНО: Правильный URL бэкенда
      const response = await fetch('http://localhost:5000/api/document/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Успешный анализ
        const analysis = data.analysis.summary;
        setDocumentAnalysis(analysis);

        // Автоматически озвучиваем результат
        speak(analysis);
      } else {
        // Ошибка от сервера
        const errorMsg = data.error || 'Analysis failed. Please try again.';
        setDocumentAnalysis(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      setDocumentAnalysis(`❌ Error: ${error.message}. Make sure backend is running on http://localhost:5000`);
    } finally {
      setUploadLoading(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error('Speech synthesis error');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported in your browser');
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="anal-page">
      <div className="bank-logo" onClick={() => nav('/')}>
        <img src={logo} alt="Bank Logo" className="logo-image" />
      </div>

      <div className="anal-header">
        <button className="back-btn" onClick={() => nav('/')}>
          ← Back
        </button>
        <h1 className="anal-title">Document Analysis</h1>
      </div>

      <div className="anal-container">
        <section className="document-section">
          <h2 className="section-title">
            <span className="title-icon">📄</span>
            Analyze Your Documents
          </h2>

          <div className="upload-area">
            <label htmlFor="file-input" className="file-label">
              {selectedFile ? (
                <div className="file-selected">
                  <div className="file-icon">📎</div>
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </div>
                  <div className="file-type">
                    {selectedFile.type || 'Unknown type'}
                  </div>
                </div>
              ) : (
                <div className="file-placeholder">
                  <div className="upload-icon">📤</div>
                  <div className="upload-text">Click to upload document</div>
                  <div className="upload-hint">
                    PDF, TXT, HTML, MD (max 10 MB)
                  </div>
                  <div className="upload-examples">
                    Examples: Contracts, Agreements, Terms of Service
                  </div>
                </div>
              )}
            </label>

            <input
              id="file-input"
              type="file"
              accept=".pdf,.txt,.html,.md"
              onChange={handleFileSelect}
              className="file-input"
            />
          </div>

          <div className="action-buttons">
            <button
              onClick={handleDocumentAnalysis}
              disabled={!selectedFile || uploadLoading}
              className={`analyze-btn ${!selectedFile || uploadLoading ? 'disabled' : ''}`}
            >
              {uploadLoading ? '⏳ Analyzing...' : '🔍 Analyze Document'}
            </button>

            {selectedFile && (
              <button
                onClick={handleClearFile}
                disabled={uploadLoading}
                className="clear-btn"
              >
                🗑️ Clear
              </button>
            )}
          </div>

          {documentAnalysis && (
            <div className="analysis-result">
              <div className="result-header">
                <span className="result-icon">📊</span>
                <span className="result-title">Analysis Result</span>
              </div>
              <div className="result-content">
                {documentAnalysis}
              </div>
            </div>
          )}

          {documentAnalysis &&
            documentAnalysis !== "📄 Analyzing document..." &&
            !documentAnalysis.startsWith('❌') && (
              <div className="audio-controls">
                {!isSpeaking ? (
                  <button
                    onClick={() => speak(documentAnalysis)}
                    className="audio-btn play-btn"
                  >
                    ▶️ Read Analysis
                  </button>
                ) : (
                  <>
                    <button onClick={stop} className="audio-btn stop-btn">
                      ⏹️ Stop
                    </button>
                    <button
                      onClick={() => speak(documentAnalysis)}
                      className="audio-btn restart-btn"
                    >
                      🔄 Restart
                    </button>
                  </>
                )}
                {isSpeaking && (
                  <span className="speaking-indicator">
                    <span className="pulse">🔊</span> Speaking...
                  </span>
                )}
              </div>
            )}

          {/* Информационная панель */}
          <div className="info-panel">
            <h3 className="info-title">💡 What can I analyze?</h3>
            <ul className="info-list">
              <li>📋 Bank loan agreements and contracts</li>
              <li>📄 Terms of service and privacy policies</li>
              <li>💼 Business agreements and proposals</li>
              <li>📝 Legal documents and disclaimers</li>
              <li>💰 Financial reports and statements</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}