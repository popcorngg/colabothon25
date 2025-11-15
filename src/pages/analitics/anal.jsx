import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './anal.css';
import logo from '../dash/logo.png';

export default function Anal() {
  const nav = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documentAnalysis, setDocumentAnalysis] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10 MB limit
      setSelectedFile(file);
    } else {
      alert('File size must be less than 10 MB');
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setDocumentAnalysis('');
    document.getElementById('file-input').value = '';
  };

  const handleDocumentAnalysis = async () => {
    if (!selectedFile) return;

    setUploadLoading(true);
    setDocumentAnalysis('📄 Анализирую документ...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setDocumentAnalysis(data.analysis || 'Analysis completed successfully!');
    } catch (error) {
      console.error('Error analyzing document:', error);
      setDocumentAnalysis('❌ Error analyzing document. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'eg-EG';
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
                </div>
              ) : (
                <div className="file-placeholder">
                  <div className="upload-icon">📤</div>
                  <div className="upload-text">Click to upload document</div>
                  <div className="upload-hint">
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
                🗑️
              </button>
            )}
          </div>

          {documentAnalysis && (
            <div className="analysis-result">
              {documentAnalysis}
            </div>
          )}

          {documentAnalysis && documentAnalysis !== "📄 Анализирую документ..." && (
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
                <span className="speaking-indicator">🔊 Speaking...</span>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}