import React, { useState } from 'react';

function DocumentAnalyzer() {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/document/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
            } else {
                alert(`Ошибка: ${data.error}`);
            }
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>📄 Анализ документов</h2>
            <input
                type="file"
                accept=".pdf,.txt,.html,.md"
                onChange={handleFileUpload}
                disabled={loading}
            />

            {loading && <p>⏳ Анализирую документ...</p>}

            {analysis && (
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
                    <h3>{analysis.filename}</h3>
                    <p>{analysis.summary}</p>
                </div>
            )}
        </div>
    );
}
```

// ## Пример ответа нейросети:
// ```
// 📋 Document Type: Bank Loan Agreement

// 🎯 Main Purpose: 
// This is a personal loan agreement between the bank and the borrower for a credit facility.

// 🔑 Key Points:
// 1. Loan amount: 50,000 zł with 8.5 % annual interest rate
// 2. Repayment period: 60 months(5 years)
// 3. Monthly payment: approximately 1,025 zł
// 4. Early repayment allowed without penalties after 12 months
// 5. Collateral required: Personal guarantee

// 📅 Important Dates:
// - Agreement effective date: January 15, 2026
//     - First payment due: February 15, 2026
//         - Final payment: January 15, 2031

// 💰 Financial Terms:
// - Processing fee: 500 zł(one - time)
//     - Late payment penalty: 0.05 % per day
//         - Insurance premium: 150 zł / year(optional)

// ⚠️ Risks / Warnings:
// - Failure to make payments may result in legal action
//     - Default can affect credit score
//         - Bank reserves the right to change interest rates with 30 days notice

// ✅ Action Required:
// Sign and return the agreement within 14 days.Set up automatic payments to avoid late fees.