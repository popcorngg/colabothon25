from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
import requests
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenRouter API configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    print("[WARNING] OPENROUTER_API_KEY не задан. Добавьте его в .env для работы API.")
    OPENROUTER_API_KEY = None

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Данные пользователя (в реальном приложении это должно браться из БД)
USER_DATA = {
    "balance": 1520.30,
    "currency": "zł",
    "card_number": "**** **** **** 1234",
    "transactions": [
        {"id": 1, "type": "income", "name": "Salary Payment", "amount": 200, "date": "12 Nov 2025", "category": "salary"},
        {"id": 2, "type": "expense", "name": "Grocery Shopping", "amount": -50, "date": "11 Nov 2025", "category": "groceries"},
        {"id": 3, "type": "expense", "name": "Pharmacy", "amount": -15, "date": "10 Nov 2025", "category": "health"},
        {"id": 4, "type": "expense", "name": "Coffee Shop", "amount": -10, "date": "10 Nov 2025", "category": "food"},
        {"id": 5, "type": "income", "name": "Gift Received", "amount": 100, "date": "09 Nov 2025", "category": "gift"}
    ]
}

# Получаем список доступных моделей при запуске
def get_available_model():
    """Получает модель из OpenRouter"""
    # Используем Llama 3.1 8B Instant для финансового ассистента
    #model = "google/gemini-flash-1.5"
    
    # Или другие бесплатные альтернативы:
    model = "mistralai/mistral-7b-instruct:free"
    # model = "microsoft/phi-3-mini-128k-instruct:free"
    # model = "qwen/qwen-2-7b-instruct:free"
    print(f"[INFO] Используем модель: {model} (OpenRouter)")
    return model

def get_financial_context():
    """Формирует контекст с информацией о финансах пользователя"""
    total_income = sum(t['amount'] for t in USER_DATA['transactions'] if t['amount'] > 0)
    total_expenses = sum(abs(t['amount']) for t in USER_DATA['transactions'] if t['amount'] < 0)
    
    context = f"""
=== ИНФОРМАЦИЯ О ФИНАНСАХ ПОЛЬЗОВАТЕЛЯ ===
Текущий баланс: {USER_DATA['balance']} {USER_DATA['currency']}
Номер карты: {USER_DATA['card_number']}
Общий доход: {total_income} {USER_DATA['currency']}
Общие расходы: {total_expenses} {USER_DATA['currency']}
Чистый результат: {total_income - total_expenses} {USER_DATA['currency']}

=== ПОСЛЕДНИЕ ТРАНЗАКЦИИ ===
"""
    
    for t in USER_DATA['transactions']:
        symbol = "+" if t['amount'] > 0 else "-"
        context += f"- [{t['date']}] {t['name']}: {symbol}{abs(t['amount'])} {USER_DATA['currency']} (категория: {t['category']})\n"
    
    return context

AVAILABLE_MODEL = get_available_model()

def call_openrouter(prompt):
    """Отправляет запрос к OpenRouter API с контекстом финансовых данных"""
    print(f"[DEBUG] Получен запрос: {prompt}")
    print(f"[DEBUG] Используем модель: {AVAILABLE_MODEL}")
    
    try:
        # Формируем контекст с информацией пользователя
        financial_context = get_financial_context()
        
        # Системный промпт с инструкциями для нейросети
        system_prompt = f"""Ты — финансовый ассистент банковского приложения. 
Твоя задача — анализировать финансы пользователя, давать советы по бюджетированию и отвечать на финансовые вопросы.

Вот информация о финансах текущего пользователя:
{financial_context}

Отвечай кратко, дружелюбно и по делу. Используй валюту zł. 
Если пользователь спрашивает что-то не о финансах, вежливо напомни, что ты специализируешься на финансовых вопросах.
Анализируй данные пользователя и давай полезные рекомендации на основе его расходов и доходов."""
        
        # Если API ключ не установлен, используем mock ответ
        if not OPENROUTER_API_KEY:
            print("[DEBUG] API Key не установлен - используем MOCK режим")
            mock_response = f"[MOCK] Финансовый ассистент: Я проанализировал ваши данные. {financial_context.split('ПОСЛЕДНИЕ')[0]}\n\nЕсли у вас есть настоящий OpenRouter ключ, добавьте его в backend/.env"
            return mock_response
        
        # Отправляем запрос к OpenRouter API
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
        }
        
        payload = {
            "model": AVAILABLE_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
            "max_tokens": 500,
        }
        
        print(f"[DEBUG] Sending request to OpenRouter...")
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        
        print(f"[DEBUG] OpenRouter Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            print(f"[DEBUG] Ответ от OpenRouter: {answer[:100]}...")
            return answer
        elif response.status_code == 401:
            print(f"[DEBUG] OpenRouter 401 - Invalid API Key")
            return "[ERROR] OpenRouter API Key недействителен. Проверьте ключ на https://openrouter.ai"
        else:
            error_msg = response.text[:200]
            print(f"[DEBUG] OpenRouter Error ({response.status_code}): {error_msg}")
            return f"Ошибка API ({response.status_code}): {error_msg}"
        
    except requests.exceptions.Timeout:
        print(f"[DEBUG] Timeout при обращении к OpenRouter")
        return "Ошибка: Timeout при обращении к API"
    except Exception as e:
        print(f"[DEBUG] Ошибка: {str(e)}")
        return f"Ошибка при обращении к API: {str(e)}"


@app.route("/api/neural-action", methods=["POST"])
def neural_action():
    body = request.json
    user_input = body.get("input", "")

    if not user_input:
        return jsonify({"error": "Input required"}), 400

    result = call_openrouter(user_input)
    return jsonify({"result": result})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/api/user/data", methods=["GET"])
def get_user_data():
    """Возвращает данные пользователя"""
    return jsonify(USER_DATA)

@app.route("/api/user/financial-context", methods=["GET"])
def get_user_context():
    """Возвращает финансовый контекст в текстовом формате"""
    context = get_financial_context()
    return jsonify({"context": context})


if __name__ == "__main__":
    print("Backend running: http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
